import logging
import gramex.cache
import pandas as pd
import urllib3
import sys
import os.path
import numpy as np
import json
import requests
import traceback
PATH = os.path.dirname(__file__)
organisation_unit = gramex.cache.open('data/ou_id_mappings.csv', 'csv', rel=True, encoding='utf-8')[
    ['uid_district', 'district', 'uid_block', 'block', 'division']]

sub_indicator_df = gramex.cache.open(
    'data_cmo/sub_indicator_data_cmo_fetch.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
sub_indicator_df_block = gramex.cache.open(
    'data_cmo/sub_indicator_data_block_cmo_fetch.csv', 'csv', rel=True, nrows=60, encoding='utf-8')

# start_date = '2022-10-01'
# fetch_date = '2022-10-01'
# end_date  = '2022-11-01'
# t_year=  [['202204','202205','202206','202207','202208','202209','202210','202211']]
# get_year_date = [date[0] for date in t_year]
# date_range = pd.date_range(
#         start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# # print(date_range)
# dates = [date for date in date_range.strftime('%Y%m')]

# fetch_date_range = pd.date_range(
#         start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]

# year_dates = [date[0:4] for date in get_year_date]

BASE_URL = 'https://uphmis.in/portalAPI/analytics.json'
district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())
# block_map_ids = gramex.cache.open('data/block_map_id.csv', 'csv', rel=True, encoding='utf-8')

config = {
    'quarter_ind': ['2021Q4','2022Q1','2022Q2','2022Q3'],
    # 'map_quarters': {'2021Q4' : '2021Q3', '2022Q1' : '2021Q4', '2022Q2': '2022Q1', '2022Q3' : '2022Q2'}
}



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
        f_path = os.path.join("error_url_cmo.csv")
        if os.path.exists(f_path):
            _data.to_csv(f_path, header=False, mode="a", index=False,
                         encoding='utf-8')
        else:
            _data.to_csv(f_path, index=False, encoding='utf-8')
        return {}


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


def remove_common_dates_in_csv(remove_dates_list, sheet_name, df,remove_data_sub):
    filepath = os.path.join(PATH,sheet_name)
    if os.path.exists(filepath):
        # Removing same date data if exists in csv sheet
        sheet_data = pd.read_csv(filepath, encoding='utf-8')
        sheet_data.drop(sheet_data.loc[(sheet_data['date'].isin(
            remove_dates_list)) & (sheet_data['subindicator_id'].isin(remove_data_sub)) ].index, inplace=True)
        # append sheet data to existing df
        df = sheet_data.append(df, ignore_index=True, sort=True)
    return df

indicator_input = ['All']

def fetch_district_data(dates, year_dates, base_url, district_ids, area='district'):
    if area == 'district':
        sheet_name = 'data_cmo/subindicator_scores_districts_cmo.csv'
        sub_df = sub_indicator_df
    elif area == 'block':
        sheet_name = 'data_cmo/subindicator_scores_blocks_cmo.csv'
        sub_df = sub_indicator_df_block


    if indicator_input == ['All']:
        sub_df_mnth =  sub_df[sub_df['period']=='monthly']
        sub_df_yearly = sub_df[sub_df['period']=='yearly']
    else:
        sub_df_mnth = (sub_df[(sub_df['period']=='monthly') & (sub_df['indicator_name'].isin(indicator_input))].drop_duplicates())
        sub_df_yearly = (sub_df[(sub_df['period']=='yearly') & (sub_df['indicator_name'].isin(indicator_input))].drop_duplicates())

    # sub_df_mnth =  sub_df[sub_df['period']=='monthly']
    # sub_df_mnth =  sub_df.query('period == "monthly" or period == "quarterly"')
    # sub_df_yearly = sub_df[sub_df['period']=='yearly']
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
            q_t = int(quarter[:-2]) -1
            fin = str(q_t) + i
        else:
            fin = quarter[:-2] + i
        if quarter not in quarter_list:
            quarter_list.append(fin)

    print(quarter_list)

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
    remove_data_sub = df_district['subindicator_id'].unique().tolist()
    # Removing same date data if exists in csv sheet
    df_district = remove_common_dates_in_csv(remove_dates_list, sheet_name, df_district,remove_data_sub)

    df_district.drop_duplicates(inplace=True)
    df_district.drop_duplicates(['date', 'district', 'subindicator_id'],inplace=True)

    # import pdb;
    # pdb.set_trace();

    # Q_dates = config['quarter_ind']
    Q_dates = quarter_list
    df_Q = df_district[df_district['date'].isin(Q_dates)]
    print(quarter)
    quarter_map =  {}

    if quarter[-2:] == "Q4":
        print("DFGFDSDFGFDSDFGFDS" , quarter)
        quarter_map[quarter] = quarter[:-2] + 'Q3'
    elif quarter[-2:] == "Q1":
        print("q1: ", quarter)
        for_q4 = int(quarter[:-2]) -1
        quarter_map[str(for_q4) + 'Q4'] = str(for_q4) + 'Q3'
        quarter_map[quarter] = str(for_q4) + 'Q4'
    elif quarter[-2:] == "Q2":
        print("Q2: ",quarter)
        for_q4 = int(quarter[:-2]) -1
        quarter_map[str(for_q4) + 'Q4'] = str(for_q4) + 'Q3'
        quarter_map[quarter[:-2] + 'Q1'] = str(for_q4) + 'Q4'
        quarter_map[quarter[:-2] + 'Q2'] = quarter[:-2] + 'Q1'
    elif quarter[-2:] == "Q3":
        print("Q2: ",quarter)
        for_q4 = int(quarter[:-2]) -1
        quarter_map[str(for_q4) + 'Q4'] = str(for_q4) + 'Q3'
        quarter_map[quarter[:-2] + 'Q1'] = str(for_q4) + 'Q4'
        quarter_map[quarter[:-2] + 'Q2'] = quarter[:-2] + 'Q1'
        quarter_map[quarter[:-2] + 'Q3'] = quarter[:-2] + 'Q2'

    print(quarter_map)

    # breakpoint()
    # _quaters = config['map_quarters']
    _quaters = quarter_map
    df_Q['date'] = df_Q['date'].apply(lambda x : _quaters[x])
    df_district.drop(df_district[df_district['date'].isin(Q_dates)].index, inplace=True)

    df_district = df_district.append(df_Q)

    # df_district['date'] =  df_district['date'].map(config['map_quarters'])
    # Final data To csv
    filepath = os.path.join(PATH,sheet_name)
    df_district.to_csv(filepath, index=False, encoding='utf-8')
    return {}




def trigger_fetch_process(args):
    status = "failed"
    error = None
    global start_date, end_date, get_year_date, year_dates, date_range, dates, fetch_date_range, fetching_dates, indicator_input
    indicators_for =  args.get('indicators_for')[0] if args.get('indicators_for') else None
    start_date = args.get('fromdate')[0] if args.get('fromdate') else None
    end_date  = args.get('todate')[0] if args.get('todate') else None
    get_year_date = args.get('year') if args.get('year') else []
    year_dates = [date[0:4] for date in get_year_date]
    date_range = pd.date_range(
            start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    # print(date_range)
    dates = [date for date in date_range.strftime('%Y%m')]

    fetch_date_range = pd.date_range(
            start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]
    indicator_input = args.get('district_indicator_ids[]') if args.get('district_indicator_ids[]') else []
    indicator_input_block = args.get('block_indicator_ids[]') if args.get('block_indicator_ids[]') else []

    try:
        if indicator_input:
            print(args, "district")
            fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
        if indicator_input_block:
            print(args, "block")
            fetch_district_data(fetching_dates, year_dates, BASE_URL, block_ids, 'block')
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        print("Error in fetch_cmo_auto.trigger_fetch_process: ", e)
    return {"status":status, "error": error}
