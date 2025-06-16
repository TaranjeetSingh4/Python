import logging
import json
import warnings
import gramex.cache
import pandas as pd
import requests
import os.path
import numpy as np
from collections import defaultdict
PATH = os.path.dirname(__file__)
warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('message')

TOTAL_DISTRICTS = 75

# Read config_cm.yaml
config = gramex.cache.open('config_cm.yaml', 'yaml', rel=True)

# Read dependency files
indicators_df = gramex.cache.open('data_cm/indicator_id_mapping_cm.csv',
                                  'csv', rel=True, encoding='utf-8')
indicators_df_block = gramex.cache.open(
    'data_cm/indicator_id_mapping_block_cm.csv', 'csv', rel=True, encoding='utf-8')
sub_indicator_df = gramex.cache.open(
    'data_cm/sub_indicator_data_cm.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
sub_indicator_df_block = gramex.cache.open(
    'data_cm/sub_indicator_data_block_cm.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
division_map_ids = gramex.cache.open('data/division_map_id.csv', 'csv', rel=True, encoding='utf-8')
district_map_ids = gramex.cache.open('data/district_map_id.csv', 'csv', rel=True, encoding='utf-8')
block_map_ids = gramex.cache.open('data/block_map_id.csv', 'csv', rel=True, encoding='utf-8')

# old file
# organisation_unit = gramex.cache.open(os.path.join(PATH, 'data', 'ou_id_mappings.csv'), 'csv', rel=True, encoding='utf-8')[
#     ['uid_district', 'district', 'uid_block', 'block', 'facility']]

# for fetching
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
#     'xlsx',
#     rel=True,
#     encoding='utf-8'
# )[['district_uid', 'district', 'block_uid', 'block', 'facility']]
# organisation_unit.rename(columns = {'district_uid': 'uid_district', 'block_uid': 'uid_block'}, inplace=True)

# for calcualations
organisation_unit = gramex.cache.open(
    os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'division_uid', 'division', 'updated_block_uid', 'updated_block_name', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'uid_district', 'division_uid': 'uid_division', 'updated_block_uid': 'uid_block', 'updated_block_name': 'block'}, inplace=True)


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
        fpath = os.path.join(PATH, "error_url_cm.csv")
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
        sheet_name = 'data_cm/subindicator_scores_districts_cm.csv'
        sub_df = sub_indicator_df
    elif area == 'block':
        sheet_name = 'data_cm/subindicator_scores_blocks_cm.csv'
        sub_df = sub_indicator_df_block

    df_district = pd.DataFrame()
    all_dates = dates + year_dates  # ['2019', '201910']
    # import pdb;
    # fetching monthly/yearly data
    for date in all_dates:
        print(date)
        temp_df = pd.DataFrame()
        for index, row in (sub_df.drop_duplicates().iterrows()):
            print(row['subindicator_id'])
            subindicator_id = row['subindicator_id']
            period = row['period']
            if ((period == 'monthly') & (len(date) == 6)) | ((period == 'yearly') & (len(date) == 4)):
                param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME".format(
                    subindicator_id, district_ids, date)
                url = base_url + param_url
                # pdb.set_trace()
                data = fetch_data(url, '')
                temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
        df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    remove_dates_list = df_district['date'].unique().tolist()  # unique dates in df
    # Removing same date data if exists in csv sheet
    df_district = remove_common_dates_in_csv(remove_dates_list, sheet_name, df_district)

    # For yearly sub-indicators that are updated once in 5 years, we replicate the date across years
    # if area == 'district':
    #     df_district = replicate_indicator_2_year(remove_dates_list, df_district)

    # Final data To csv
    fpath = os.path.join(PATH, sheet_name)
    df_district.to_csv(fpath, index=False, encoding='utf-8')
    return {}


"""For yearly sub-indicators (ind_2) that are updated once in 5 years, we replicate the date across years """


def replicate_indicator_2_year(remove_dates_list, df_district):
    # Year array
    year_array = [x for x in remove_dates_list if len(x) == 4]
    # 5 year indicators for which data needs to be generated
    # removed 'FRafAE8qFP6', 'ux6uaflq7xZ'on 26-05-2022
    re = [ 'cB6y5lovUZX.Ti9FJqkSK6J']

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
    current_fy = get_fy(date)

    # Filters relevant methods from indicator_mapping dict
    # ['indicator_7', 'indicator_7_method', 'indicator_7_method_qa', 'indicator_10']
    _keys = [key for key in config[map].keys()]
    _keys = [key for key in _keys if len(key) <= 12]  # ['indicator_7', 'indicator_10 ]

    # import pdb;
    # pdb.set_trace()

    processed_df = pd.DataFrame()
    for ind_id in _keys:
        indicators = config[map][ind_id]  # {'a': 'ux6uaflq7xZ', 'b': 'cB6y5lovUZX.Ti9FJqkSK6J'}
        # 'ux6uaflq7xZ', 'cB6y5lovUZX.Ti9FJqkSK6J']
        _subindicators = [sub_id for sub_id in indicators.values()]

        data = df[df['subindicator_id'].isin(_subindicators) & df['date'].isin([date, current_fy])]
        data.drop_duplicates(inplace=True)
        data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)

        if data.empty:
            continue
        data['perc_point'] = eval(config[map][ind_id + '_method']
                                  ).replace(np.inf, 0)  # apply formula

        data['date'] = date
        data['indicator_id'] = ind_id
        data.drop(_subindicators, axis=1, inplace=True)
        processed_df = processed_df.append(data)

    return processed_df


"""Indicator (Yearly) - calculate formula values"""


def indicator_yr(date, data, map, indicator_id, sub_period_df):
    # date array
    # yearly, date =  ["201904", "201905", "201906", "201907", "201908", "201909"]
    # monthly, date =  ["201907", "201908", "201909"]

    current_fy = get_fy(date[0])

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

    # Sample output
    # district_id       a0  a1 a2 a b
    # HkZSq61JwqL        1  1  1  1 1

    # Apply formula and derive perc point
    formula = config[map][indicator_id+'_method_yr']
    formula = formula.format(len(date))  # no of months is substituted
    data_total['perc_point'] = eval(formula).replace(np.inf, 0)
    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = indicator_id
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)

    return data_total


"""Return FY year """


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

def write_df(new_df, file_name):
    """Write the csv file after deleting existing dates"""
    # remove timestamp from date column and convert to string

    # If date column not a object string, convert to string
    if (new_df['date'].dtype != 'O'):
        new_df['date'] = new_df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    file_path = os.path.join(PATH,file_name)

    if os.path.exists(file_path):
        ''' Removing same date data if exists '''
        uniq_dates = new_df['date'].unique().tolist()
        old_df = pd.read_csv(file_path, encoding='utf-8')
        old_df.drop(old_df.loc[old_df['date'].isin(uniq_dates)].index,
                         inplace=True)
        new_df = old_df.append(new_df, ignore_index=True, sort=True)
    new_df.to_csv(
        file_path,
        index=False,
        encoding='utf-8')
