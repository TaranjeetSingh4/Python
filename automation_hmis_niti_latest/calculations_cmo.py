import logging
import json
import warnings
import gramex.cache
import pandas as pd
import requests
import os.path
import numpy as np
import datetime
from collections import defaultdict


import pdb
PATH = os.path.dirname(__file__)
warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('message')

TOTAL_DISTRICTS = 75

# Read config_cmo.yaml
config = gramex.cache.open('config_cmo.yaml', 'yaml', rel=True)

# Read dependency files
indicators_df = gramex.cache.open('data_cmo/indicator_id_mapping_cmo.csv',
                                  'csv', rel=True, encoding='utf-8')
indicators_df_block = gramex.cache.open(
    'data_cmo/indicator_id_mapping_block_cmo.csv', 'csv', rel=True, encoding='utf-8')
sub_indicator_df = gramex.cache.open(
    'data_cmo/sub_indicator_data_cmo.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
sub_indicator_df_block = gramex.cache.open(
    'data_cmo/sub_indicator_data_block_cmo.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
division_map_ids = gramex.cache.open('data/division_map_id.csv', 'csv', rel=True, encoding='utf-8')
district_map_ids = gramex.cache.open('data/district_map_id.csv', 'csv', rel=True, encoding='utf-8')
block_map_ids = gramex.cache.open('data/block_map_id.csv', 'csv', rel=True, encoding='utf-8')
organisation_unit = gramex.cache.open('data/ou_id_mappings.csv', 'csv', rel=True, encoding='utf-8')[
    ['uid_district', 'district', 'uid_block', 'block', 'facility']]

fin_months = {1: 10, 2: 11, 3: 12}


""" Fetches data from API - sub indicator, http request"""


def fetch_data(url, indicator_mapping):
    try:
        if indicator_mapping == 'indicator_13_14':
            resp = requests.get(url,
                                auth=requests.auth.HTTPBasicAuth('Gramener', 'Gramener@123'),
                                headers={'content-type': 'application/json'})
        else:
            resp = requests.get(url, verify=False,
                                headers={'content-type': 'application/json'})
        return json.loads(resp.text)
    except Exception:
        _data = pd.DataFrame([url], columns=['urls'])
        fpath = os.path.join(PATH,"error_url_cmo.csv")
        if os.path.exists(fpath):
            _data.to_csv(fpath, header=False, mode="a", index=False,
                         encoding='utf-8')
        else:
            _data.to_csv(fpath, index=False, encoding='utf-8')
        return {}


""" Process the API data to required format"""


def get_row_dict(data, date, i_type='all'):

    dict_list = list()
    try:
        if (len(data['rows']) != 0):
            if (len(data['rows'][0]) == 3):
                for d in data['rows']:
                    try:
                        dic_ = data['metaData']['names']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            'district_id': d[1],
                            'district': dic_[d[1]].strip(),
                            'value': d[2]
                        })
                    except KeyError:
                        dic_ = data['metaData']['items']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            'district_id': d[1],
                            'district': dic_[d[1]]['name'].strip(),
                            'value': d[2]
                        })
                return dict_list
            elif (len(data['rows'][0]) == 4):
                for d in data['rows']:
                    try:
                        dic_ = data['metaData']['names']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            'district_id': d[1],
                            'district': dic_[d[1]].strip(),
                            'value': d[3]
                        })
                    except KeyError:
                        dic_ = data['metaData']['items']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            'district_id': d[1],
                            'district': dic_[d[1]]['name'].strip(),
                            'value': d[3]
                        })
                df = pd.DataFrame(dict_list)
                if (i_type != 'one'):
                    df = pd.merge(df,
                                  organisation_unit[
                                      ['district', 'district_id']] .drop_duplicates(),
                                  on='district_id', how='outer')
                    df.rename(columns={'district_y': 'district'}, inplace=True)
                    df['date'] = date
                    del df['district_x']
                return df.fillna(0)
    except KeyError:
        return dict_list


""" Fetches district level data."""


def fetch_district_data(dates, year_dates, base_url, district_ids, area='district'):
    if area == 'district':
        sheet_name = 'data_cmo/subindicator_scores_districts_cmo.csv'
        sub_df = sub_indicator_df
    elif area == 'block':
        sheet_name = 'data_cmo/subindicator_scores_blocks_cmo.csv'
        sub_df = sub_indicator_df_block

    sub_df_mnth =  sub_df[sub_df['period']=='monthly']
    # sub_df_mnth =  sub_df.query('period == "monthly" or period == "quarterly"')
    sub_df_yearly = sub_df[sub_df['period']=='yearly']
    subindicator_ids_mnthly = ';'.join(sub_df_mnth['subindicator_id'].str.strip().unique())
    subindicator_ids_yrly = ';'.join(sub_df_yearly['subindicator_id'].str.strip().unique())
    print("sub_ind_monthly:",subindicator_ids_mnthly)
    print("sub_ind_yearly:",subindicator_ids_yrly)
    print("********")
    df_district = pd.DataFrame()
    all_dates = dates + year_dates  # ['2019', '201910']
    print("all_dates",all_dates)
    # fetching monthly/yearly
    for date in all_dates:
        print("date:",date)
        temp_df = pd.DataFrame()
        ids = ''
        if len(date) == 6: #monthly
            ids = subindicator_ids_mnthly
        if len(date) == 4: # yearly
            ids = subindicator_ids_yrly
        param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME".format(ids, district_ids, date)
        try:
            url = base_url + param_url
            data = fetch_data(url, '')
            temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
        except IndexError:
            print('no data')
        finally:
            df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    # fetching quarterly
    print("q_ind"*30, config['quarter_ind'])


    q = int(dates[-1])%100
    y = int(dates[-1])//100
    print(y)
    if q >0 and q<=3:
        quarter = str(y-1) +'Q4'
    elif q>3 and q<=6:
        quarter = str(y) +'Q1'
    elif q>6 and q<=9:
        quarter = str(y) +'Q2'
    elif q>9 and q<=12:
        quarter = str(y) +'Q3'

    y_list = ['Q1','Q2','Q3','Q4']
    q_list = ['Q4','Q1','Q2','Q3']

    print(quarter)

    year_lists = []

    for i in y_list:
        j = quarter[-2:]
        if j == i:
            year_lists.append(quarter)
            break
        fin = quarter[:-2] + i
        year_lists.append(fin)

    print(year_lists)

    quarter_list =[]
    for i in q_list:
        j = quarter[-2:]
        if j == i:
            if quarter not in quarter_list:
                quarter_list.append(quarter)
            break
        if i == 'Q4':
            # breakpoint()
            q_t = int(quarter[:-2]) -1
            fin = str(q_t) + i
        else:
            fin = quarter[:-2] + i
        if quarter not in quarter_list:
            quarter_list.append(fin)

    print(quarter_list)

    # breakpoint()

    # for date in config['quarter_ind']:
    for date in quarter_list:
        print("qdate:", date)
        temp_df = pd.DataFrame()
        ids = ';'.join(sub_df.query('period == "quarterly"')['subindicator_id'].unique())
        print("q_ids"*10, ids)
        param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME".format(ids, district_ids, date)
        try:
            url = base_url + param_url
            data = fetch_data(url, '')
            temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
        except IndexError:
            print('no data')
        finally:
            df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    # for date in dates:
    #     print("date:",date)
    #     temp_df = pd.DataFrame()
    #     # ids = 'VTkU0Lmb5qL;TmeumlBaObG;t03VPkJ5UXd;GXgfTS67qxe.Ti9FJqkSK6J;IDNHJYN6E5Y;FRafAE8qFP6;SwyOYejItro;ux6uaflq7xZ;cB6y5lovUZX.Ti9FJqkSK6J;LSbY5u051cG;Nkk4laRIihw'
    #     # ids = 'JY4UIeCYK00;qYpFbVo8WsL;ZpgnTGpSkeg.Ti9FJqkSK6J;n5bZeD7f63Q;VGmj8dWOIBw;kuz5MYYLyi2;aknlXIekL1Z;GJKYhq2wR9L;B2A7x36qEry.Ti9FJqkSK6J;m7ggqyMXhyL;RUlj9ZTZtwt;W8umWqoVKIg;qPCgDZKWRA7;aRueVYr35yM.Ti9FJqkSK6J;ed73Rp6knzD;xm2HG3ytwRd;DtwEf8pGyBN;gam41B0zoHy;A5OhgcYE7gV;KXkDMUaCa1b;TzzsXTlaZkf;aRueVYr35yM;Gj9oZKbPSFW;fyuGMPRH02k;jHHZKr89vwY;c3WaIW0ETmo;JSd2zYYtiwU;yHUXCcJHccA;mQ2Ri2lEPsH;Pk1DOE3HGly;ewTOwzwOdvW'
    #     ids = subindicator_ids_mnthly
    #     param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME".format(ids, district_ids, date)
    #     try:
    #         url = base_url + param_url
    #         data = fetch_data(url, '')
    #         temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
    #     except IndexError:
    #         print('no data')
    #     finally:
    #         df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    remove_dates_list = df_district['date'].unique().tolist()  # unique dates in df
    # Removing same date data if exists in csv sheet
    df_district = remove_common_dates_in_csv(remove_dates_list, sheet_name, df_district)

    df_district.drop_duplicates(inplace=True)
    df_district.drop_duplicates(['date', 'district', 'subindicator_id'],inplace=True)

    # import pdb;
    # pdb.set_trace();

    # Q_dates = config['quarter_ind']
    Q_dates = quarter_list
    df_Q = df_district[df_district['date'].isin(Q_dates)]
    _quaters = config['map_quarters']
    df_Q['date'] = df_Q['date'].apply(lambda x : _quaters[x])
    df_district.drop(df_district[df_district['date'].isin(Q_dates)].index, inplace=True)

    df_district = df_district.append(df_Q)

    # df_district['date'] =  df_district['date'].map(config['map_quarters'])
    # Final data To csv
    fpath = os.path.join(PATH, sheet_name)
    df_district.to_csv(fpath, index=False, encoding='utf-8')
    return {}


"""For yearly sub-indicators (ind_2) that are updated once in 5 years, we replicate the date across years """


def replicate_indicator_2_year(remove_dates_list, df_district):
    # Year array
    year_array = [x for x in remove_dates_list if len(x) == 4]
    # 5 year indicators for which data needs to be generated
    re = ['FRafAE8qFP6', 'ux6uaflq7xZ', 'cB6y5lovUZX.Ti9FJqkSK6J']

    # Remove entries for 2019 for re(4) indicators in current df
    df_district = df_district.loc[~ (df_district['subindicator_id'].isin(
        re) & df_district['date'].isin(year_array))]
    # Get 2017 data from df
    df_2017 = df_district.loc[(df_district['subindicator_id'].isin(re)
                               & df_district['date'].isin([2017]))]

    # Append replicated data with changed dates
    for x in year_array:
        df_test_2017 = df_2017
        df_test_2017 = df_test_2017.replace(2017, x)
        df_district = df_district.append(df_test_2017)

    return df_district


"""Removing same date data if exists in csv sheet"""


def remove_common_dates_in_csv(remove_dates_list, sheet_name, df):
    fpath = os.path.join(PATH, sheet_name)
    if os.path.exists(fpath):
        # Removing same date data if exists in csv sheet
        sheet_data = pd.read_csv(fpath, encoding='utf-8')
        sheet_data.drop(sheet_data.loc[sheet_data['date'].isin(
            remove_dates_list)].index, inplace=True)
        # append sheet data to existing df
        df = sheet_data.append(df, ignore_index=True, sort=True)
    return df


"""Indicator (Monthly) - calculate formula values"""
""" Sample input data
    date district  district_id          subindicator_id  value
    201909  Sambhal  YzHpzrN0eLv  B2A7x36qEry.Ti9FJqkSK6J  199.0

    Output data
    subindicator_id  B2A7x36qEry.Ti9FJqkSK6J  GXgfTS67qxe.Ti9FJqkSK6J  perc_point    date  indicator_id
    district_id
    AcnMkNGgc3S                         89.0                   8858.1   12.056762  201909  indicator_10
"""


def indicator_month(date, df, map):
    # current_fy = get_fy(date)
    # print("****date:", date, current_fy)

    # Filters relevant methods from indicator_mapping dict
    # ['indicator_7', 'indicator_7_method', 'indicator_7_method_qa', 'indicator_10']
    _keys = [key for key in config[map].keys()]
    _keys = [key for key in _keys if len(key) <= 12]  # ['indicator_7', 'indicator_10 ]
    # import pdb;
    # pdb.set_trace();

    processed_df = pd.DataFrame()
    for ind_id in _keys:
        print("****indicator_id:",ind_id)
        if ind_id == 'indicator_15' or ind_id == 'indicator_21':
            print("in*****",ind_id)
            # dates = config['quarter_cal']
            check_point = ['06', '09', '12', '03']
            # current_fy = get_fy(date)
            if date[4:] in check_point:
                # current quater date
                _date = get_quarter_date(date,get_cur_quarter(date),True) #2019Q3
                current_fy = str(_date[:-2])
            else:
                # previous quarter date
                _date = get_quarter_date(date,get_prev_quarter(date),False)
                current_fy = str(_date[:-2])
        else:
            _date = date
            current_fy = str(get_fy(date))

        print("****_date:",_date,current_fy)

        # ****
        indicators = config[map][ind_id]  # {'a': 'ux6uaflq7xZ', 'b': 'cB6y5lovUZX.Ti9FJqkSK6J'}
        # 'ux6uaflq7xZ', 'cB6y5lovUZX.Ti9FJqkSK6J']
        _subindicators = [sub_id for sub_id in indicators.values()]
        data = df[df['subindicator_id'].isin(_subindicators) & df['date'].isin([_date, str(current_fy)])]
        data.drop_duplicates(inplace=True)
        data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
        for sub_ind in _subindicators:
            if sub_ind not in list(data.columns):
                print(sub_ind)
                data[sub_ind] = None
        # import pdb; pdb.set_trace()
        if data.empty:
            data['perc_point'] = 0

            data['date'] = date
            data['indicator_id'] = ind_id
        else:

            # if ind_id == 'indicator_7':
            #     # financial year starts form JAN
            #     number_of_months = pd.to_datetime(date, format='%Y%m').month
            # else:
            #     #  financial year starts form APR
            #     number_of_months = pd.to_datetime(date, format='%Y%m').month
            #     if number_of_months in [1 ,2, 3]:
            #         number_of_months =  fin_months[number_of_months]
            #     else:
            #         number_of_months = pd.to_datetime(date, format='%Y%m').month - 3
            number_of_months = get_number_of_months_in_fin_yr(ind_id,date)
            print(number_of_months)
            data['perc_point'] = eval((config[map][ind_id + '_method']).format(number_of_months)).replace(np.inf, 0)  # apply formula
            if(ind_id == 'indicator_14' or ind_id == 'indicator_23'):
                data['perc_point'] = (data['perc_point'] / data['perc_point'].max()) * 100
            data['date'] = date
            data['indicator_id'] = ind_id
        data.drop(_subindicators, axis=1, inplace=True)
        # pdb.set_trace();
        processed_df = processed_df.append(data)

    return processed_df

def calculate_14_17_20_23(date, data, map, indicator_id, sub_period_df):
    print("14,17,20,23")
    print("****indicator:", indicator_id)
    # import pdb
    # pdb.set_trace()

    if len(date) > 2:
        _date = date[2]
        _prev_date = get_previous_quarter_end_date(pd.to_datetime(_date, format='%Y%m'))
        _prev_date = "".join(str(_prev_date).split('-'))[:-2]
        cur_quarter = get_cur_quarter(_date)
        q_list = [_prev_date, _date]
        current_fy = str(get_fy(_date))
    else:
        current_fy = str(get_fy(date[0]))
        cur_quarter = get_cur_quarter(date[0])
        q_list = ['', '']
        return

    print("****q_lsit", q_list)

    indicators = config[map][indicator_id]  # {'a': 'YEbwZRpntxW', 'b': 'RW3tc5FKbgy'}
    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']
    # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}
    sub_dict_rev = {v: k for k, v in indicators.items()}

    print("*****indicators:",indicators)
    print("*****_subindicators:",_subindicators)
    print("*****sub_dict_rev:",sub_dict_rev)
    print("*****cur_quarter:",cur_quarter)
    print("*****current_fy:",current_fy)

    # separate yearly and monthly subindicator data
    data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(q_list)]
    # date_prev_q = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([prev_date])]

    data_yearly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([current_fy])]
    data_monthly.drop_duplicates(inplace=True)
    # date_prev_q.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    sub_period_df = sub_period_df[sub_period_df['subindicator_id'].isin(_subindicators)]

    sub_yearly = sub_period_df[sub_period_df['period'] == 'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']


    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)

        # For loop 1: data_total = Merge all monthly sub keys
    # district_id       a0  a1 c0 c1
    # HkZSq61JwqL        1  1  1  1
    for i, _date_ in enumerate(q_list):
        list_a.extend("{}{}".format(ind, i) for ind in sub_monthly)  # ['a0', 'c0', 'a1', 'c1', 'a2', 'c2']
        for key in sub_monthly:
            sub_pseudo_i = "{}{}".format(key, i)  # 'a0'
            key_dict[key].append(sub_pseudo_i)    # {'a': ['a0', 'a1'], 'c': ['c0', 'c1']}

            data_a_jan = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([_date_])]
            data_a_jan.drop_duplicates(inplace=True)

            if len(data_a_jan) != 0:
                # To df, add column a0 to store value
                data_a_jan[sub_pseudo_i] = data_a_jan['value']
                # df, retain columns district_id, a0
                # district_id       a0
                # HkZSq61JwqL  33973.0
                data_a_jan = data_a_jan[['district_id', sub_pseudo_i]]

                # data_total = Merge all sub keys
                # district_id       a0  a1 c0 c1
                # HkZSq61JwqL        1  1  1  1
                if len(data_total) != 0:
                    data_total = pd.merge(
                        data_total, data_a_jan, on="district_id", how='outer')
                else:
                    data_total = data_total.append(data_a_jan)
            else:
                data_total[sub_pseudo_i] = 0

        if(_date_ != '0000'):
            temp_date = date[0]  # 201909
    # end of for loop 1

    # Derive columns a , c and append to data_total df
    # a = a0 + a1 + a2 + a3
    for k, v in key_dict.items():  # {'a': ['a0', 'a1', 'a2', 'a3']})
        data_total[k] = data_total[v].sum(axis=1)
        list_a.append(k)  # ['a0', 'a1', 'a2', 'a3', 'a']
    # end of for loop 2

    # Derive yearly sub columns and append to df
    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)

        if len(data_b) != 0:
            data_b[sub_pseudo_b] = data_b['value']
            data_b = data_b[['district_id', sub_pseudo_b]]
            if len(data_total) != 0:
                data_total = pd.merge(
                    data_total, data_b, on="district_id", how='outer')
            else:
                data_total = data_total.append(data_b)
        else:
            data_total[sub_pseudo_b] = 0
        # end of for loop 3

    # Sample output
    # district_id       a0  a1 a2 a b
    # HkZSq61JwqL        1  1  1  1 1

    # Apply formula and derive perc point
    # number_of_months = pd.to_datetime(_date, format='%Y%m').month - 3
    number_of_months = get_number_of_months_in_fin_yr(indicator_id,_date)
    formula = config[map][indicator_id+'_method_qa']
    formula = formula.format(len(date))  # no of months is substituted
    # data_total['perc_point'] = eval(formula).format(number_of_months).replace(np.inf, 0)
    if indicator_id == 'indicator_14':
        if cur_quarter == 1:
            data_total['perc_point'] = eval("(data_total['a1'] * 100000) / (data_total['b1'] * {})".format(number_of_months))
            data_total['perc_point'] =  (data_total['perc_point'] / data_total['perc_point'].max()) * 100
        else:
            data_total['perc_point'] = eval(formula.format(number_of_months)).replace(np.inf, 0)
            data_total['perc_point'] =  (data_total['perc_point'] / data_total['perc_point'].max()) * 100
    elif indicator_id == 'indicator_17':
        # pdb.set_trace();
        if cur_quarter == 1:
            data_total['perc_point'] = eval("((data_total['a1']) / (data_total['b'] / 12) * 3)*100")
        else:
            data_total['perc_point'] = eval(formula.format(number_of_months)).replace(np.inf, 0)
    elif indicator_id == 'indicator_20':
        if cur_quarter == 1:
            data_total['perc_point'] = eval("((data_total['a1']) / (data_total['b1'] / 12))*100")
        else:
            data_total['perc_point'] = eval(formula.format(number_of_months)).replace(np.inf, 0)
    elif indicator_id == 'indicator_23':
        if cur_quarter == 1:
            data_total['perc_point'] = eval("(data_total['a1'] * 100000) / (data_total['b1'])")
            data_total['perc_point'] =  (data_total['perc_point'] / data_total['perc_point'].max()) * 100
        else:
            data_total['perc_point'] = eval(formula.format(number_of_months)).replace(np.inf, 0)
            data_total['perc_point'] =  (data_total['perc_point'] / data_total['perc_point'].max()) * 100
         #eval("( (data_total['a1'])/(data_total['b1'] ) * 100").replace(np.inf, 0)

    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = indicator_id
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)

    return data_total

def calculate15_21_quarterly(date, data, map, indicator_id, sub_period_df):
    print("15,21")
    print("date:",date)
    import pdb;
    # ['201910','201911','201912']
    # _keys = ['indicator_14', 'indicator_15','indicator_17','indicator_20','indicator_21','indicator_23']
    # if indicator_id == 'indicator_15' or indicator_id == 'indicator_21':
    print("in*****", indicator_id)
    # dates = config['quarter_cal']
    # check_point = ['06', '09', '12', '03']
    # _date = date[2]
    # current_fy = get_fy(date)
    # if date[4:] in check_point:
    # current quater date
    if len(date) > 2:
        _date = date[2]
        cur_date = get_quarter_date(_date, get_cur_quarter(_date), True)  # 2019Q3
        prev_date = get_quarter_date(_date, get_prev_quarter(_date), False)  # 2019Q2
        q_list = [prev_date, cur_date]
        current_fy = str(cur_date[:-2])
    else:
        current_fy = str(date[0][:-2])
        q_list = ['', '']
        return
    # else:
    #     # previous quarter date
    #     _date = get_quarter_date(date,get_prev_quarter(date),False)
    #     current_fy = _date[:-2]

    indicators = config[map][indicator_id]  # {'a': 'YEbwZRpntxW', 'b': 'RW3tc5FKbgy'}
    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']
    # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}
    sub_dict_rev = {v: k for k, v in indicators.items()}

    # separate yearly and monthly subindicator data
    data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(q_list)]
    # date_prev_q = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([prev_date])]

    data_yearly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([current_fy])]
    data_monthly.drop_duplicates(inplace=True)
    # date_prev_q.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    sub_period_df = sub_period_df[sub_period_df['subindicator_id'].isin(_subindicators)]

    # for yearly subs, extract actual ids
    # for monthly subs, extract pseudo names (a,b,c)
    sub_yearly = sub_period_df[sub_period_df['period'] == 'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    sub_monthly = [sub_dict_rev[k]
                    for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']

    # define variables
    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)

    # For loop 1: data_total = Merge all monthly sub keys
    # district_id       a0  a1 c0 c1
    # HkZSq61JwqL        1  1  1  1
    for i, _date_ in enumerate(q_list):
        list_a.extend("{}{}".format(ind, i)
                        for ind in sub_monthly)  # ['a0', 'c0', 'a1', 'c1', 'a2', 'c2']
        for key in sub_monthly:
            sub_pseudo_i = "{}{}".format(key, i)  # 'a0'
            key_dict[key].append(sub_pseudo_i)    # {'a': ['a0', 'a1'], 'c': ['c0', 'c1']}

            data_a_jan = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([_date_])]
            data_a_jan.drop_duplicates(inplace=True)

            if len(data_a_jan) != 0:
                # To df, add column a0 to store value
                data_a_jan[sub_pseudo_i] = data_a_jan['value']
                # df, retain columns district_id, a0
                # district_id       a0
                # HkZSq61JwqL  33973.0
                data_a_jan = data_a_jan[['district_id', sub_pseudo_i]]

                # data_total = Merge all sub keys
                # district_id       a0  a1 c0 c1
                # HkZSq61JwqL        1  1  1  1
                if len(data_total) != 0:
                    data_total = pd.merge(
                        data_total, data_a_jan, on="district_id", how='outer')
                else:
                    data_total = data_total.append(data_a_jan)
            else:
                data_total[sub_pseudo_i] = 0

        if(_date_ != '0000'):
            temp_date = date[0]  # 201909
    # end of for loop 1

    # Derive columns a , c and append to data_total df
    # a = a0 + a1 + a2 + a3
    for k, v in key_dict.items():  # {'a': ['a0', 'a1', 'a2', 'a3']})
        data_total[k] = data_total[v].sum(axis=1)
        list_a.append(k)  # ['a0', 'a1', 'a2', 'a3', 'a']
    # end of for loop 2

    # Derive yearly sub columns and append to df
    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)

        if len(data_b) != 0:
            data_b[sub_pseudo_b] = data_b['value']
            data_b = data_b[['district_id', sub_pseudo_b]]
            if len(data_total) != 0:
                data_total = pd.merge(
                    data_total, data_b, on="district_id", how='outer')
            else:
                data_total = data_total.append(data_b)
        else:
            data_total[sub_pseudo_b] = 0
        # end of for loop 3

    # Sample output
    # district_id       a0  a1 a2 a b
    # HkZSq61JwqL        1  1  1  1 1

    # Apply formula and derive perc point
    formula = config[map][indicator_id+'_method_qa']
    formula = formula.format(len(date))  # no of months is substituted
    # if indicator_id == 'indicator_15':
    if cur_date[4:] == 'Q1':
        data_total['perc_point'] = eval("( (data_total['a1'])/(data_total['b'] ) ) * 100").replace(np.inf, 0)
    else:
        data_total['perc_point'] = eval(formula).replace(np.inf, 0)
    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = indicator_id
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)

    # pdb.set_trace();

    return data_total

def indicator_qa(date, data, map, indicator_id, sub_period_df):
    # import pdb
    # pdb.set_trace();
    print("***indicator_id,",indicator_id)
    print("****date:",date)
    # import pdb
    # pdb.set_trace()
    # date array
    # yearly, date =  ["201904", "201905", "201906", "201907", "201908", "201909"]
    # monthly, date =  ["201907", "201908", "201909"]

    current_fy = str(get_fy(date[0]))
    print("****current_fy:",current_fy)

    # Fetch subindicators corresponding to the indicator
    # Assume num 'a' is monthly, den 'b' is yearly
    indicators = config[map][indicator_id]  # {'a': 'YEbwZRpntxW', 'b': 'RW3tc5FKbgy'}
    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']
    # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}
    sub_dict_rev = {v: k for k, v in indicators.items()}

    # separate yearly and monthly subindicator data
    data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(date)]
    data_yearly = data[data['subindicator_id'].isin(
        _subindicators) & data['date'].isin([current_fy])]
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    # subindicator_id         type   period
    # YEbwZRpntxW         Numerator  monthly
    sub_period_df = sub_period_df[sub_period_df['subindicator_id'].isin(_subindicators)]

    # for yearly subs, extract actual ids
    # for monthly subs, extract pseudo names (a,b,c)
    sub_yearly = sub_period_df[sub_period_df['period'] ==
                               'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']

    # define variables
    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)

    # For loop 1: data_total = Merge all monthly sub keys
    # district_id       a0  a1 c0 c1
    # HkZSq61JwqL        1  1  1  1
    for i, _date_ in enumerate(date):
        list_a.extend("{}{}".format(ind, i)
                      for ind in sub_monthly)  # ['a0', 'c0', 'a1', 'c1', 'a2', 'c2']
        for key in sub_monthly:
            sub_pseudo_i = "{}{}".format(key, i)  # 'a0'
            key_dict[key].append(sub_pseudo_i)    # {'a': ['a0', 'a1'], 'c': ['c0', 'c1']}

            data_a_jan = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([_date_])]
            data_a_jan.drop_duplicates(inplace=True)

            if len(data_a_jan) != 0:
                # To df, add column a0 to store value
                data_a_jan[sub_pseudo_i] = data_a_jan['value']
                # df, retain columns district_id, a0
                # district_id       a0
                # HkZSq61JwqL  33973.0
                data_a_jan = data_a_jan[['district_id', sub_pseudo_i]]

                # data_total = Merge all sub keys
                # district_id       a0  a1 c0 c1
                # HkZSq61JwqL        1  1  1  1
                if len(data_total) != 0:
                    data_total = pd.merge(
                        data_total, data_a_jan, on="district_id", how='outer')
                else:
                    data_total = data_total.append(data_a_jan)
            else:
                data_total[sub_pseudo_i] = 0

        if(_date_ != '0000'):
            temp_date = _date_  # 201909
    # end of for loop 1

    # Derive columns a , c and append to data_total df
    # a = a0 + a1 + a2 + a3
    for k, v in key_dict.items():  # {'a': ['a0', 'a1', 'a2', 'a3']})
        data_total[k] = data_total[v].sum(axis=1)
        list_a.append(k)  # ['a0', 'a1', 'a2', 'a3', 'a']
    # end of for loop 2

    # Derive yearly sub columns and append to df
    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)

        if len(data_b) != 0:
            data_b[sub_pseudo_b] = data_b['value']
            data_b = data_b[['district_id', sub_pseudo_b]]
            if len(data_total) != 0:
                data_total = pd.merge(
                    data_total, data_b, on="district_id", how='outer')
            else:
                data_total = data_total.append(data_b)
        else:
            data_total[sub_pseudo_b] = 0
        # end of for loop 3
    # pdb.set_trace()
    # Sample output
    # district_id       a0  a1 a2 a b
    # HkZSq61JwqL        1  1  1  1 1

    # Apply formula and derive perc point
    formula = config[map][indicator_id+'_method_qa']
    formula = formula.format(len(date))  # no of months is substituted
    data_total['perc_point'] = eval(formula).replace(np.inf, 0)
    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = indicator_id
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)

    return data_total

"""Indicator (Yearly) - calculate formula values"""
def indicator_yr(date, data, map, indicator_id, sub_period_df):
    # import pdb
    # pdb.set_trace();
    print('/n')
    print('/n')
    print('/n')

    print("***indicator_id,",indicator_id)
    print("****date",date)
    # import pdb
    # pdb.set_trace()
    # date array
    # yearly, date =  ["201904", "201905", "201906", "201907", "201908", "201909"]
    # monthly, date =  ["201907", "201908", "201909"]


    if indicator_id == 'indicator_15' or indicator_id == 'indicator_21':
        current_fy = str(date[0][:-2])
    else:
        current_fy = str(get_fy(date[0]))
    print("current_fy:",current_fy)

    # Fetch subindicators corresponding to the indicator
    # Assume num 'a' is monthly, den 'b' is yearly
    indicators = config[map][indicator_id]  # {'a': 'YEbwZRpntxW', 'b': 'RW3tc5FKbgy'}
    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']
    # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}
    sub_dict_rev = {v: k for k, v in indicators.items()}

    print("******indicators",indicators)
    print("******_subindicators",_subindicators)
    print("******sub_dict_rev",sub_dict_rev)

    # separate yearly and monthly subindicator data
    dates_st = []
    for i in date:
        dates_st.append(str(i))
    data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(dates_st)]
    data_yearly = data[data['subindicator_id'].isin(
        _subindicators) & data['date'].isin([current_fy])]
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    # subindicator_id         type   period
    # YEbwZRpntxW         Numerator  monthly
    sub_period_df = sub_period_df[sub_period_df['subindicator_id'].isin(_subindicators)]

    # for yearly subs, extract actual ids
    # for monthly subs, extract pseudo names (a,b,c)
    sub_yearly = sub_period_df[sub_period_df['period'] ==
                               'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']

    # define variables
    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)

    # For loop 1: data_total = Merge all monthly sub keys
    # district_id       a0  a1 c0 c1
    # HkZSq61JwqL        1  1  1  1
    for i, _date_ in enumerate(date):
        list_a.extend("{}{}".format(ind, i)
                      for ind in sub_monthly)  # ['a0', 'c0', 'a1', 'c1', 'a2', 'c2']
        for key in sub_monthly:
            sub_pseudo_i = "{}{}".format(key, i)  # 'a0'
            key_dict[key].append(sub_pseudo_i)    # {'a': ['a0', 'a1'], 'c': ['c0', 'c1']}

            data_a_jan = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([str(_date_)])]
            data_a_jan.drop_duplicates(inplace=True)

            if len(data_a_jan) != 0:
                # To df, add column a0 to store value
                data_a_jan[sub_pseudo_i] = data_a_jan['value']
                # df, retain columns district_id, a0
                # district_id       a0
                # HkZSq61JwqL  33973.0
                data_a_jan = data_a_jan[['district_id', sub_pseudo_i]]

                # data_total = Merge all sub keys
                # district_id       a0  a1 c0 c1
                # HkZSq61JwqL        1  1  1  1
                if len(data_total) != 0:
                    data_total = pd.merge(
                        data_total, data_a_jan, on="district_id", how='outer')
                else:
                    data_total = data_total.append(data_a_jan)
            else:
                data_total[sub_pseudo_i] = 0

        if(_date_ != '0000'):
            if indicator_id in ['indicator_15', 'indicator_21']:
                temp_date = date[0][:-2] + '04'  # 201909
            else:
                temp_date = date[0]  # 201909
    # end of for loop 1

    # Derive columns a , c and append to data_total df
    # a = a0 + a1 + a2 + a3
    for k, v in key_dict.items():  # {'a': ['a0', 'a1', 'a2', 'a3']})
        data_total[k] = data_total[v].sum(axis=1)
        list_a.append(k)  # ['a0', 'a1', 'a2', 'a3', 'a']
    # end of for loop 2

    # Derive yearly sub columns and append to df
    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)

        if len(data_b) != 0:
            data_b[sub_pseudo_b] = data_b['value']
            data_b = data_b[['district_id', sub_pseudo_b]]
            if len(data_total) != 0:
                data_total = pd.merge(
                    data_total, data_b, on="district_id", how='outer')
            else:
                data_total = data_total.append(data_b)
        else:
            data_total[sub_pseudo_b] = 0
        # end of for loop 3

    # Sample output
    # district_id       a0  a1 a2 a b
    # HkZSq61JwqL        1  1  1  1 1
    # if indicator_id == 'indicator_7':
    #     # financial year starts form JAN
    #     number_of_months = pd.to_datetime(date, format='%Y%m').month
    # else:
    #     #  financial year starts form APR
    #     number_of_months = pd.to_datetime(date, format='%Y%m').month - 3
    # if indicator_id != 'indicator_15' or indicator_id != 'indicator_21':
    formula = config[map][indicator_id+'_method_yr']
    # if indicator_id not in ['indicator_15', 'indicator_21']:
    #     no_of_months = get_number_of_months_in_fin_yr(indicator_id,date)
    # Apply formula and derive perc point
    # # formula = formula.format(len(date))  # no of months is substituted
    # if indicator_id not in ['indicator_15', 'indicator_21']:
    #     formula = formula.format(int(no_of_months))  # no of months is substituted
    # else:
    formula = formula.format(len(date))  # no of months is substituted
    data_total['perc_point'] = eval(formula).replace(np.inf, 0)
    # data['perc_point'] = eval((config[map][ind_id + '_method']).format(number_of_months)).replace(np.inf, 0)  # apply formula
    if(indicator_id == 'indicator_14' or indicator_id == 'indicator_23'):
        data_total['perc_point'] = (data_total['perc_point'] / data_total['perc_point'].max()) * 100
    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = indicator_id
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)

    return data_total

# def calculate_15_21_yr(date, data, map, indicator_id, sub_period_df):

# """Return FY year """
def get_fy(x):
    x = pd.to_datetime(x, format='%Y%m')
    if (x.month > 3):
        return x.year
    else:
        return x.year - 1

""" Return quarter to which that month belongs to."""
def add_quater(x):
    x = pd.to_datetime(x, format='%Y%m')
    if (x.month >= 1 and x.month <= 3):
        return 4
    elif (x.month >= 4 and x.month <= 6):
        return 1
    elif (x.month >= 7 and x.month <= 9):
        return 2
    elif (x.month >= 10 and x.month <= 12):
        return 3

# returns current quarter number
def get_cur_quarter(date):
    _d = pd.to_datetime(date, format='%Y%m')
    Q = pd.Timestamp(_d).quarter
    if Q == 1:
        Q = 4
    else:
        Q = Q - 1
    return Q

# returns previous quarter number
def get_prev_quarter(date):
    p_Q = get_cur_quarter(date)
    if p_Q == 1:
        p_Q = 4
    else:
        p_Q = p_Q - 1
    return p_Q

#  returns date in format of 2019Q3
def get_quarter_date(date, Q,current=True):
    if current:
        if Q == 4:
            return str((int(date[:-2]) - 1)) + 'Q' + str(Q)
        else:
            return date[:-2] + 'Q' + str(Q)
    else:
        if Q == 4 or Q == 3:
            return str((int(date[:-2]) - 1)) + 'Q' + str(Q)
        else:
            return date[:-2] + 'Q' + str(Q)

# returns date in format of 202003
def get_previous_quarter_end_date(date):
    if date.month < 4:
        return datetime.date(date.year - 1, 12, 31)
    elif date.month < 7:
        return datetime.date(date.year, 3, 31)
    elif date.month < 10:
        return datetime.date(date.year, 6, 30)
    return datetime.date(date.year, 9, 30)

# returns number of months
def get_number_of_months_in_fin_yr(ind_id,date):
    # pdb.set_trace()
    number_of_months = pd.to_datetime(date, format='%Y%m').month
    if ind_id == 'indicator_7':
        return number_of_months
    else:
        if number_of_months in [1 ,2, 3]:
            number_of_months =  fin_months[number_of_months]
        else:
            number_of_months = pd.to_datetime(date, format='%Y%m').month - 3

    return number_of_months

def write_df(new_df, file_name):
    fpath = os.path.join(PATH, file_name)
    """Write the csv file after deleting existing dates"""
    # remove timestamp from date column and convert to string

    # If date column not a object string, convert to string
    if (new_df['date'].dtype != 'O'):
        new_df['date'] = new_df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    if os.path.exists(fpath):
        ''' Removing same date data if exists '''
        uniq_dates = new_df['date'].unique().tolist()
        old_df = pd.read_csv(fpath, encoding='utf-8')
        old_df.drop(old_df.loc[old_df['date'].isin(uniq_dates)].index,
                         inplace=True)
        new_df = old_df.append(new_df, ignore_index=True, sort=True)
        new_df['perc_point'] = new_df['perc_point'].fillna(0)
    new_df.to_csv(
        fpath,
        index=False,
        encoding='utf-8')
