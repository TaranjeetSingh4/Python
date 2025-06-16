"""Put a doc string."""
import logging
import traceback
import json
import warnings
import gramex.cache
import pandas as pd
import requests
import os.path
import numpy as np
import block_level_indicator_15_16 as block_15_16
from datetime import datetime
import dateutil.relativedelta
from collections import defaultdict
PATH = os.path.dirname(__file__)
asha_values = {
    '201710': 7, '201711': 8, '201712': 9, '201801': 10, '201802': 11, '201803': 12,
    '201804': 1, '201805': 2, '201806': 3, '201807': 4, '201808': 5, '201809': 6, '201810': 7,
    '201811': 8, '201812': 9, '201901': 10, '201902': 11, '201903': 12, '201904': 1, '201905': 2,
    '201906': 3, '201907': 4, '201908': 5, '201909': 6, '201910': 7, '201911': 8, '201912': 9
}

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('message')
TOTAL_DISTRICTS = 75

config = gramex.cache.open('config.yaml', 'yaml', rel=True)

"""
All indicator values are dependent on sub_indicators except 13 and 14.
The subindicator_ids are available in sub_indicator_data.csv.
"""
sub_indicator_df = gramex.cache.open(
    'data/sub_indicator_data.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)

"""
URL's are provided for indicator 3 instead of indicator id's,
All the url are present in sub_indicator_url.csv
"""
sub_indicator_url_df = gramex.cache.open(
    'data/sub_indicator_url.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)

"""
Indicator 13 and 14 data is dependent on elements UID's and data available quaterly.
There are total 24 element UID's in uid_elements_mapping.csv.
"""
indicator_14_sub_indicators = gramex.cache.open(
    'data/uid_elements_mapping.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)

"""
Organisatoin unit contains all organisation(district/block/division/facility) ID's and name.
"""
# old file
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH, 'data', 'ou_id_mappings.csv'),
#     'csv',
#     rel=True,
#     encoding='utf-8'
# )[['uid_district', 'district', 'uid_block', 'block']].rename(
#     columns={'uid_district': 'district_id', 'uid_block': 'block_id'})


# for data fetching
organisation_unit = gramex.cache.open(
    os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'block_uid', 'block', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'district_id', 'block_uid': 'block_id'}, inplace=True)


# for calculations
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
#     'xlsx',
#     rel=True,
#     encoding='utf-8'
# )[['district_uid', 'district', 'updated_block_uid', 'updated_block_name', 'facility']]
# organisation_unit.rename(columns = {'district_uid': 'district_id', 'updated_block_uid': 'block_id', 'updated_block_name': 'block'}, inplace=True)



def get_fy(x):
    # return '2017'
    x = pd.to_datetime(x, format='%Y%m')
    if (x.month > 3):
        # print(x, x.year)
        return x.year
    else:
        # print(x, x.year - 1)
        return x.year - 1

def indicator_12_qa(date, data):
    """Return calculated data for indicator 13."""
    curr_date = int(date[-1]) # convert string to date
    current_qa = get_cur_quarter(curr_date)
    if(current_qa != 'Q1'):
        # prev_date = curr_date - 1 # subtract 1 month
        # prev_prev_date = curr_date - 2 # subtract 2 month
        # # date = [202112, 202201, 202202]
        # date = [prev_prev_date, prev_date, curr_date]
        if curr_date%100 == 1:
            prev_date = curr_date - 89
            prev_prev_date = prev_date -1
        elif curr_date% 100 == 2:
            prev_date = curr_date - 1
            prev_prev_date = prev_date -89
        else:
            prev_date = curr_date -1
            prev_prev_date = prev_date - 1
        date = [prev_prev_date, prev_date, curr_date]
        print(date, 'date')
        # # breakpoint()
    indicators = config['indicator_mappings']['indicator_12']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame(columns=['district_id'])
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    _def_date = ""
    _lista = []
    _listb = []
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a, on="district_id", how='left')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='left')
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
        if(_data != '0000' and _data != '2017'):
          _def_date = _data
    # calculation method
    # import pdb; pdb.set_trace()
    test_resutl = data_all.loc[data_all['district_id'] == 'bNmwkrQeP3e']
    print(test_resutl)
    # This method will get called only in the Q1 and first month(i.e.., April)
    if(len(date) == 1):
        data_all['perc_point'] =  eval(
            "(data_all['a0'] * 100000 / 2) / data_all['b0']"
        )
    # This method will get called only in the Q1 and second month(i.e.., May)
    elif(len(date) == 2):
        data_all['perc_point'] =  eval(
            "(((data_all['a0'] - 0) + (data_all['a1'] - data_all['a0'])) * 100000 / 2) / data_all['b1']"
        )
    # This method will get called in the Q1 and third month(i.e.., June) and for all the remaining months
    elif(len(date) == 3):
        data_all['perc_point'] =  eval(
            "(((data_all['a1'] - data_all['a0']) + (data_all['a2'] - data_all['a1'])) * 100000 / 2) / data_all['b1']"
        )
    # data_all['perc_point'] =  eval(
    #     config['indicator_mappings']['indicator_12_method_qa'].format(len(date)))
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_12'
    sub = _lista + _listb
    data_all.drop(sub, axis=1, inplace=True)
    data_all = data_all.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    # data_all.drop(data_all.index[data_all['perc_point'] == np.inf], inplace=True)
    print(data_all)
    return data_all


def indicator_12_yr(date, data):
    """Return calculated data for indicator 13."""
    indicators = config['indicator_mappings']['indicator_12']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    _def_date = ""
    _lista = []
    _listb = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a, on="district_id", how='left')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='left')
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
        _def_date = _data
    # calculation method
    print(len(date))
    print(_lista)
    magic_num = 100000
    new_lista = _lista[-1]
    new_listb = _listb[-1]
    # data_all['a'] = data_all[_lista].sum(axis=1)
    # data_all['b'] = data_all[_listb].sum(axis=1)
    # # breakpoint()
    data_all['perc_point'] = (
        (data_all[new_lista]* magic_num / len(date)) / data_all[new_listb]).fillna(0)
    test_resutl = data_all.loc[data_all['district_id'] == 'bNmwkrQeP3e']
    print(test_resutl)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_12'
    sub = _lista + _listb
    data_all = data_all.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    # data_all.drop(data_all.index[data_all['perc_point'] == np.inf], inplace=True)
    data_all.drop(sub, axis=1, inplace=True)
    return data_all

def indicator_11_qa(date, data):
    indicators = config['indicator_mappings']['indicator_11']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)
            else:
                data_all[name_a1] = 0
                data_all['a2'] = 0
            if(_data != '0000' and _data !='2017'):
                _def_date = _data
    # if('201903' in date):
    #     date = ['201901','201902']
    current_fy = get_fy(date[0])
    data_b = data[data['subindicator_id'].isin(
        [indicators['b']]) & data['date'].isin([current_fy])]
    data_b = data_b[['district_id', 'value']]
    data_all = pd.merge(data_all, data_b, on="district_id")
    data_all['perc_point'] = eval(
        (config['indicator_mappings']['indicator_11_method_qa']).format(len(date))).fillna(0)
    data_all.replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_11'
    required_subindicators = ['a0', 'a1', 'a2', 'value']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all


def indicator_11_yr(date, data):
    indicators = config['indicator_mappings']['indicator_11']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data_b = data[data['subindicator_id'].isin(
        [indicators['b']]) & data['date'].isin([current_fy])]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_b.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        _lista.append(name_a1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)

            _def_date = _data
        else:
            data_all[name_a1] = 0
    data_b = data_b[['district_id', 'value']]
    data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
    data_all['a'] = data_all[_lista].sum(axis=1)
    # data_all['value'] = data_all['value']
    data_all['perc_point'] = (
        (data_all['a'] /
         ((data_all['value'] /
         12)*len(date))) *
        100).fillna(0)
    data_all.replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_11'
    required_subindicators = _lista + ['a', 'value']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all

def indicator_10_qa(date, data):
    """Return calculated data for indicator 10."""
    # import pdb;
    # pdb.set_trace()
    cur_date = date[-1]
    current_fy = get_fy(cur_date)
    current_qa = get_cur_quarter_tb(cur_date) # returns quarter number eg: 1
    if current_qa != 1:
        if len(date) < 2:
            prev_date = get_previous_quarter_end_date_tb(pd.to_datetime(cur_date, format='%Y%m'))
            prev_date = "".join(str(datetime.date(prev_date)).split('-'))[:-2]
            prev_date = get_prev_month_tb_qa(prev_date)
            date_list = [prev_date, cur_date]
        else:
            prev_date = get_previous_quarter_end_date_tb(pd.to_datetime(cur_date, format='%Y%m'))
            prev_date = "".join(str(datetime.date(prev_date)).split('-'))[:-2]
            date_list = [prev_date, cur_date]
    else:
        date_list = [cur_date]

    # prev_date = get_prev_month_tb(date)
    # date_list = [prev_date, date]
    indicators = config['indicator_mappings']['indicator_10']

    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']

    sub_dict_rev = {v: k for k, v in indicators.items()}  # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}

    required_subindicators = [indicators[k] for k in indicators]

    # data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(date_list)]
    # data_yearly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([current_fy])]

    data_monthly = data[(data['subindicator_id'] == "B2A7x36qEry.Ti9FJqkSK6J") & (data['date'].isin(date_list))] #numerator
    data_yearly = data[(data['subindicator_id'] == "GXgfTS67qxe.Ti9FJqkSK6J") & (data['date'].isin([cur_date])) ] # denominator. is also monthly. but using same variable.
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    sub_period_df = sub_indicator_df[sub_indicator_df['subindicator_id'].isin(_subindicators)]

    sub_a = sub_period_df[sub_period_df['subindicator_id'] == 'B2A7x36qEry.Ti9FJqkSK6J']['subindicator_id'].unique().tolist()
    sub_b = sub_period_df[sub_period_df['subindicator_id'] == 'GXgfTS67qxe.Ti9FJqkSK6J']['subindicator_id'].unique().tolist()


    # sub_yearly = sub_period_df[sub_period_df['period'] == 'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    # sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']
    sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_b)]  # ['a']
    sub_yearly = sub_b # sub_period_df[sub_period_df['period'] == 'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']

    newdf = pd.DataFrame()

    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)

    for i, _date_ in enumerate(date_list):
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

    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([cur_date])]
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

    # pdb.set_trace();

    # data_total = data_total.set_index('district_id')

    # data = data.pivot(
    #     index='district_id',
    #     columns='subindicator_id',
    #     values='value').fillna(0)

    # data_total['perc_point'] = eval("(data_total['a1'] - data_total['a0']) / (data_total['b'] / 12)") * 100
    # # breakpoint()
    if current_qa != 1:
        data_total['perc_point'] = eval(config['indicator_mappings']['indicator_10_method_qa'])
    else:
        # data_total['perc_point'] = eval("(data_total['a0'] /(data_total['b])*(3/12))*100")
        data_total['perc_point'] = eval("(data_total['a0'] /(data_total['b'] * 3))*100")

    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = 'indicator_10'
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)
    data_total.loc[data_total['perc_point'] > 100, 'perc_point'] = 100

    return data_total


def indicator_10_yr(date, data):
    # import pdb;
    # pdb.set_trace();
    _date = [date[-1]]
    current_fy = [get_fy(_date[0])]
    indicators = config['indicator_mappings']['indicator_10']
    date_list = [date[-1], get_fy(date[0])]
    # # breakpoint()
    # _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']

    # sub_dict_rev = {v: k for k, v in indicators.items()}  # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}

    required_subindicators = [indicators[k] for k in indicators]
    print("required_subindicators", required_subindicators)
    # current_fy = get_fy(date[0])
    # data_b = data[data['subindicator_id'].isin(
    #     [indicators['b']]) & data['date'].isin([current_fy])]
    # data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin(date)]
    data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin(date_list)]
    data.drop_duplicates(inplace=True)
    # data_b.drop_duplicates(inplace=True)
    data_all = pd.DataFrame(columns=['district_id'])
    _def_date = ""
    _lista = []
    for idx, _data in enumerate(_date):
        name_a1 = "a{}".format(idx)
        _lista.append(name_a1)
        data_a = data[data['subindicator_id'].isin([indicators['a']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)
        else:
            data_all[name_a1] = 0
        _def_date = _data

    _listb = []
    for idx, _data in enumerate(_date):
        name_a1 = "b{}".format(idx)
        _listb.append(name_a1)
        data_b = data[data['subindicator_id'].isin([indicators['b']]) & data['date'].isin([_data])]
        data_b.drop_duplicates(inplace=True)
        if len(data_b) != 0:
            data_b[name_a1] = data_b['value']
            data_b = data_b[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_b)
        else:
            data_all[name_a1] = 0
        # _def_date = _data

    # data_b = data_b[['district_id', 'value']]
    # print(data_all, data_b)
    # data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
    # import pdb;
    # pdb.set_trace();
    # data_all['a'] = data_all[_lista].sum(axis=1)
    # data_all['b'] = data_all[_listb].sum(axis=1)


    # data_all['value'] = data_all['value']
    # data_all['perc_point'] = ( (data_all['a'] / (data_all['b']) ) * 100).fillna(0)
    # data_all['perc_point'] = (( data_all['a0'] / (data_all['b0']) * (len(date)/12) ) * 100).fillna(0)
    # # breakpoint()
    data_all['perc_point'] = (( data_all['a0'] / (data_all['b0'] * len(date)) ) * 100).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_10'
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    required_subindicators = _lista + _listb
    data_all.drop(required_subindicators, axis=1, inplace=True)
    return data_all


def indicator_9_qa(date, data):
    """Return calculated data for indicator 9."""
    # import pdb;
    # pdb.set_trace();

    indicators = config['indicator_mappings']['indicator_9']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data = data[data['subindicator_id'].isin(required_subindicators)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_c = pd.DataFrame()
    data_d = pd.DataFrame()
    data_e = pd.DataFrame()
    data_f = pd.DataFrame()
    data_g = pd.DataFrame()
    data_h = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            name_c1 = "c{}".format(idx)
            name_d1 = "d{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_c = data[data['subindicator_id'].isin(
                [indicators['c']]) & data['date'].isin([_data])]
            data_d = data[data['subindicator_id'].isin(
                [indicators['d']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            data_c.drop_duplicates(inplace=True)
            data_d.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_c[name_c1] = data_c['value']
                data_c = data_c[['district_id', name_c1]]
                data_d[name_d1] = data_d['value']
                data_d = data_d[['district_id', name_d1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
                data_all = pd.merge(data_all, data_c, on="district_id")
                data_all = pd.merge(data_all, data_d, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                data_all[name_c1] = 0
                data_all[name_d1] = 0
                data_all['a2'] = 0
                data_all['b2'] = 0
                data_all['c2'] = 0
                data_all['d2'] = 0
            if(_data != '0000'):
                _def_date = _data

    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
    data_e = data[data['subindicator_id'].isin([indicators['e']]) & data[
        'date'].isin([current_fy])]
    data_e.drop_duplicates(inplace=True)
    data_e['e'] = data_e['value']
    data_e = data_e[['district_id', 'e']]
    data_all = pd.merge(data_all, data_e, on="district_id")

    data_f = data[data['subindicator_id'].isin([indicators['f']]) & data[
        'date'].isin([current_fy])]
    data_f.drop_duplicates(inplace=True)
    data_f['f'] = data_f['value']
    data_f = data_f[['district_id', 'f']]
    data_all = pd.merge(data_all, data_f, on="district_id")

    data_g = data[data['subindicator_id'].isin([indicators['g']]) & data[
        'date'].isin([current_fy])]
    data_g.drop_duplicates(inplace=True)
    data_g['g'] = data_g['value']
    data_g = data_g[['district_id', 'g']]
    data_all = pd.merge(data_all, data_g, on="district_id")

    data_h = data[data['subindicator_id'].isin([indicators['h']]) & data[
        'date'].isin([current_fy])]
    data_h.drop_duplicates(inplace=True)
    data_h['h'] = data_h['value']
    data_h = data_h[['district_id', 'h']]
    data_all = pd.merge(data_all, data_h, on="district_id")

    data_all['N1'] = data_all['a0'] + \
        data_all['b0'] + data_all['c0'] + data_all['d0']
    data_all['N2'] = data_all['a1'] + \
        data_all['b1'] + data_all['c1'] + data_all['d1']
    data_all['N3'] = data_all['a2'] + \
        data_all['b2'] + data_all['c2'] + data_all['d2']
    data_all['D'] = (100 - (data_all['f'] + data_all['g'] +
                            data_all['h'] + 5)) * data_all['e'] / 100
    # calculation method
    data_all['perc_point'] = eval(
        config['indicator_mappings']['indicator_8_method_qa'])
    required_subindicators = [
        'a0',
        'a1',
        'a2',
        'b0',
        'b1',
        'b2',
        'c0',
        'c1',
        'c2',
        'd0',
        'd1',
        'd2',
        'e',
        'f',
        'g',
        'h',
        'N1',
        'N2',
        'N3',
        'D']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_9'

    return data_all


def indicator_9_yr(date, data):
    """Return calculated data for indicator 9."""
    indicators = config['indicator_mappings']['indicator_9']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data_e = data[data['subindicator_id'].isin([indicators['e']]) & data[
        'date'].isin([current_fy])]
    data_f = data[data['subindicator_id'].isin([indicators['f']]) & data[
        'date'].isin([current_fy])]
    data_g = data[data['subindicator_id'].isin([indicators['g']]) & data[
        'date'].isin([current_fy])]
    data_h = data[data['subindicator_id'].isin([indicators['h']]) & data[
        'date'].isin([current_fy])]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)

    data_all = pd.DataFrame()
    _lista = []
    _listb = []
    _listc = []
    _listd = []
    _def_date = ""
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        name_c1 = "c{}".format(idx)
        name_d1 = "d{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        _listc.append(name_c1)
        _listd.append(name_d1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_c = data[data['subindicator_id'].isin(
            [indicators['c']]) & data['date'].isin([_data])]
        data_d = data[data['subindicator_id'].isin(
            [indicators['d']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        data_c.drop_duplicates(inplace=True)
        data_d.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_c[name_c1] = data_c['value']
            data_c = data_c[['district_id', name_c1]]
            data_d[name_d1] = data_d['value']
            data_d = data_d[['district_id', name_d1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
            data_all = pd.merge(data_all, data_c, on="district_id", how='outer')
            data_all = pd.merge(data_all, data_d, on="district_id", how='outer')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
            data_all[name_c1] = 0
            data_all[name_d1] = 0

    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
    data_e.drop_duplicates(inplace=True)
    data_e['e'] = data_e['value']
    data_e = data_e[['district_id', 'e']]
    data_all = pd.merge(data_all, data_e, on="district_id", how='outer')

    data_f.drop_duplicates(inplace=True)
    data_f['f'] = data_f['value']
    data_f = data_f[['district_id', 'f']]
    data_all = pd.merge(data_all, data_f, on="district_id", how='outer')

    data_g.drop_duplicates(inplace=True)
    data_g['g'] = data_g['value']
    data_g = data_g[['district_id', 'g']]
    data_all = pd.merge(data_all, data_g, on="district_id", how='outer')

    data_h.drop_duplicates(inplace=True)
    data_h['h'] = data_h['value']
    data_h = data_h[['district_id', 'h']]
    data_all = pd.merge(data_all, data_h, on="district_id", how='outer')

    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    data_all['c'] = data_all[_listc].sum(axis=1)
    data_all['d'] = data_all[_listd].sum(axis=1)

    data_all['N'] = data_all['a'] + \
        data_all['b'] + data_all['c'] + data_all['d']
    data_all['D'] = (100 - (data_all['f'] + data_all['g'] +
                            data_all['h'] + 5)) * data_all['e'] / 100
    # calculation method
    data_all['perc_point'] = (data_all['N'] / data_all['D'] * 1000).fillna(0)

    required_subindicators = _lista + _listb + _listc + _listd + [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'N',
        'D']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_9'
    return data_all


def indicator_8_qa(date, data):
    """Return calculated data for indicator 8."""
    indicators = config['indicator_mappings']['indicator_8']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data = data[data['subindicator_id'].isin(required_subindicators)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_c = pd.DataFrame()
    data_d = pd.DataFrame()
    data_e = pd.DataFrame()
    data_f = pd.DataFrame()
    data_g = pd.DataFrame()
    data_h = pd.DataFrame()
    data_i = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            name_c1 = "c{}".format(idx)
            name_d1 = "d{}".format(idx)
            name_e1 = "e{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_c = data[data['subindicator_id'].isin(
                [indicators['c']]) & data['date'].isin([_data])]
            data_d = data[data['subindicator_id'].isin(
                [indicators['d']]) & data['date'].isin([_data])]
            data_e = data[data['subindicator_id'].isin(
                [indicators['e']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            data_c.drop_duplicates(inplace=True)
            data_d.drop_duplicates(inplace=True)
            data_e.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_c[name_c1] = data_c['value']
                data_c = data_c[['district_id', name_c1]]
                data_d[name_d1] = data_d['value']
                data_d = data_d[['district_id', name_d1]]
                data_e[name_e1] = data_e['value']
                data_e = data_e[['district_id', name_e1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
                data_all = pd.merge(data_all, data_c, on="district_id")
                data_all = pd.merge(data_all, data_d, on="district_id")
                data_all = pd.merge(data_all, data_e, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                data_all[name_c1] = 0
                data_all[name_d1] = 0
                data_all[name_e1] = 0
                data_all['a2'] = 0
                data_all['b2'] = 0
                data_all['c2'] = 0
                data_all['d2'] = 0
                data_all['e2'] = 0
            if(_data != '0000'):
                _def_date = _data

    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
    data_f = data[data['subindicator_id'].isin([indicators['f']]) & data[
        'date'].isin([current_fy])]
    data_f.drop_duplicates(inplace=True)
    data_f['f'] = data_f['value']
    data_f = data_f[['district_id', 'f']]
    data_all = pd.merge(data_all, data_f, on="district_id")

    data_g = data[data['subindicator_id'].isin([indicators['g']]) & data[
        'date'].isin([current_fy])]
    data_g.drop_duplicates(inplace=True)
    data_g['g'] = data_g['value']
    data_g = data_g[['district_id', 'g']]
    data_all = pd.merge(data_all, data_g, on="district_id")

    data_h = data[data['subindicator_id'].isin([indicators['h']]) & data[
        'date'].isin([current_fy])]
    data_h.drop_duplicates(inplace=True)
    data_h['h'] = data_h['value']
    data_h = data_h[['district_id', 'h']]
    data_all = pd.merge(data_all, data_h, on="district_id")

    data_i = data[data['subindicator_id'].isin([indicators['i']]) & data[
        'date'].isin([current_fy])]
    data_i.drop_duplicates(inplace=True)
    data_i['i'] = data_i['value']
    data_i = data_i[['district_id', 'i']]
    data_all = pd.merge(data_all, data_i, on="district_id")

    data_all['N1'] = data_all['a0'] + data_all['b0'] + \
        data_all['c0'] + data_all['d0'] + data_all['e0']
    data_all['N2'] = data_all['a1'] + data_all['b1'] + \
        data_all['c1'] + data_all['d1'] + data_all['e1']
    data_all['N3'] = data_all['a2'] + data_all['b2'] + \
        data_all['c2'] + data_all['d2'] + data_all['e2']
    data_all['D'] = (100 - (data_all['g'] + data_all['h'] +
                            data_all['i'] + 5)) * data_all['f'] / 100
    # calculation method
    data_all['perc_point'] = eval(
        config['indicator_mappings']['indicator_8_method_qa'])
    required_subindicators = [
        'a0', 'a1', 'a2', 'b0', 'b1', 'b2', 'c0', 'c1', 'c2', 'd0', 'd1', 'd2', 'e0', 'e1', 'e2',
        'f', 'g', 'h', 'i', 'N1', 'N2', 'N3', 'D']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_8'
    return data_all


def indicator_8_yr(date, data):
    """Return calculated data for indicator 8."""
    indicators = config['indicator_mappings']['indicator_8']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data_f = data[data['subindicator_id'].isin([indicators['f']]) & data[
        'date'].isin([current_fy])]
    data_g = data[data['subindicator_id'].isin([indicators['g']]) & data[
        'date'].isin([current_fy])]
    data_h = data[data['subindicator_id'].isin([indicators['h']]) & data[
        'date'].isin([current_fy])]
    data_i = data[data['subindicator_id'].isin([indicators['i']]) & data[
        'date'].isin([current_fy])]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    _listc = []
    _listd = []
    _liste = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        name_c1 = "c{}".format(idx)
        name_d1 = "d{}".format(idx)
        name_e1 = "e{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        _listc.append(name_c1)
        _listd.append(name_d1)
        _liste.append(name_e1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_c = data[data['subindicator_id'].isin(
            [indicators['c']]) & data['date'].isin([_data])]
        data_d = data[data['subindicator_id'].isin(
            [indicators['d']]) & data['date'].isin([_data])]
        data_e = data[data['subindicator_id'].isin(
            [indicators['e']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        data_c.drop_duplicates(inplace=True)
        data_d.drop_duplicates(inplace=True)
        data_e.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_c[name_c1] = data_c['value']
            data_c = data_c[['district_id', name_c1]]
            data_d[name_d1] = data_d['value']
            data_d = data_d[['district_id', name_d1]]
            data_e[name_e1] = data_e['value']
            data_e = data_e[['district_id', name_e1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
            data_all = pd.merge(data_all, data_c, on="district_id", how='outer')
            data_all = pd.merge(data_all, data_d, on="district_id", how='outer')
            data_all = pd.merge(data_all, data_e, on="district_id", how='outer')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
            data_all[name_c1] = 0
            data_all[name_d1] = 0
            data_all[name_e1] = 0

    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)

    data_f.drop_duplicates(inplace=True)
    data_f['f'] = data_f['value']
    data_f = data_f[['district_id', 'f']]
    data_all = pd.merge(data_all, data_f, on="district_id", how='outer')

    data_g.drop_duplicates(inplace=True)
    data_g['g'] = data_g['value']
    data_g = data_g[['district_id', 'g']]
    data_all = pd.merge(data_all, data_g, on="district_id", how='outer')

    data_h.drop_duplicates(inplace=True)
    data_h['h'] = data_h['value']
    data_h = data_h[['district_id', 'h']]
    data_all = pd.merge(data_all, data_h, on="district_id", how='outer')

    data_i.drop_duplicates(inplace=True)
    data_i['i'] = data_i['value']
    data_i = data_i[['district_id', 'i']]
    data_all = pd.merge(data_all, data_i, on="district_id", how='outer')

    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    data_all['c'] = data_all[_listc].sum(axis=1)
    data_all['d'] = data_all[_listd].sum(axis=1)
    data_all['e'] = data_all[_liste].sum(axis=1)

    data_all = data_all.fillna(0)

    data_all['N'] = data_all['a'] + data_all['b'] + \
        data_all['c'] + data_all['d'] + data_all['e']
    data_all['D'] = (100 - (data_all['g'] + data_all['h'] +
                            data_all['i'] + 5)) * data_all['f'] / 100
    # calculation method
    data_all['perc_point'] = (data_all['N'] / data_all['D'] * 1000).fillna(0)
    required_subindicators = _lista + _listb + _listc + _listd + _liste + [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'N',
        'D']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_8'
    return data_all


def indicator_7_qa(date, data):
    indicators = config['indicator_mappings']['indicator_7']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)
            else:
                data_all[name_a1] = 0
                data_all['a2'] = 0
            if(_data != '0000' and _data !='2017'):
                _def_date = _data
    # if('201903' in date):
    #     date = ['201901','201902']
    current_fy = get_fy(date[0])
    data_b = data[data['subindicator_id'].isin(
        [indicators['b']]) & data['date'].isin([current_fy])]
    data_b = data_b[['district_id', 'value']]
    data_all = pd.merge(data_all, data_b, on="district_id")
    data_all['perc_point'] = eval(
        (config['indicator_mappings']['indicator_7_method_qa']).format(len(date))).fillna(0)
    data_all.replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_7'
    required_subindicators = ['a0', 'a1', 'a2', 'value']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all

def indicator_7_yr(date, data):
    indicators = config['indicator_mappings']['indicator_7']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data_b = data[data['subindicator_id'].isin(
        [indicators['b']]) & data['date'].isin([current_fy])]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_b.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        _lista.append(name_a1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)

            _def_date = _data
        else:
            data_all[name_a1] = 0
    data_b = data_b[['district_id', 'value']]
    data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
    data_all['a'] = data_all[_lista].sum(axis=1)
    # data_all['value'] = data_all['value']
    data_all['perc_point'] = (
        (data_all['a'] /
         ((data_all['value'] /
         12)*len(date))) *
        100).fillna(0)
    data_all.replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_7'
    required_subindicators = _lista + ['a', 'value']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all



def indicator_6_yr(date, data):
    """Return calculated data for indicator 6."""
    indicators = config['indicator_mappings']['indicator_6']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a, on="district_id", how='left')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_all = pd.merge(
                data_all, data_b, on="district_id", how='left')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    data_all['perc_point'] = (data_all['a'] / data_all['b']).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_6'
    sub = _lista + _listb + ['a', 'b']
    data_all.drop(sub, axis=1, inplace=True)
    return data_all


def indicator_6_qa(date, data):
    """Return calculated data for indicator 6."""
    indicators = config['indicator_mappings']['indicator_6']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                data_all['a2'] = 0
                data_all['b2'] = 0
            if(_data != '0000'):
                _def_date = _data
    data_all['perc_point'] = eval(
        config['indicator_mappings']['indicator_6_method_qa']).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_6'
    required_subindicators = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    return data_all

def indicator_5_yr(date, data):
    """Return calculated data for indicator 5."""
    indicators = config['indicator_mappings']['indicator_5']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a, on="district_id", how='left')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_all = pd.merge(
                data_all, data_b, on="district_id", how='left')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    # import pdb; pdb.set_trace()
    data_all['perc_point'] = ((data_all['a'] / data_all['b'])*100).fillna(0)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_5'
    sub = _lista + _listb + ['a', 'b']
    data_all.drop(sub, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all


def indicator_5_qa(date, data):
    """Return calculated data for indicator 5."""
    indicators = config['indicator_mappings']['indicator_5']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    # data = data.pivot(index='district_id', columns='subindicator_id', values='value').fillna(0)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            # import pdb; pdb.set_trace()
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                # data_all['a2'] = 0
                # data_all['b2'] = 0
            if(_data != '0000'):
                _def_date = _data
    # Replace all nans with 0 for months for which there is no data
    # nan + 2 = nan, so replace nan with 0
    data_all = data_all.fillna(0)

    data_all['perc_point'] = eval(
        config['indicator_mappings']['indicator_5_method_qa']).replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_5'
    required_subindicators = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all



def indicator_4_yr(date, data):
    """Return calculated data for indicator 3."""
    indicators = config['indicator_mappings']['indicator_4']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    _listc = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        name_c1 = "c{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        _listc.append(name_c1)
        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_c = data[data['subindicator_id'].isin(
            [indicators['c']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        data_c.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a, on="district_id", how='left')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_c[name_c1] = data_c['value']
            data_c = data_c[['district_id', name_c1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='left')
            data_all = pd.merge(data_all, data_c, on="district_id", how='left')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
            data_all[name_c1] = 0

    # calculation method
    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    data_all['c'] = data_all[_listc].sum(axis=1)
    data_all['perc_point'] = (
        data_all['a'] / (data_all['b'] + data_all['c']) * 1000).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_4'
    sub = _lista + _listb + _listc + ['a', 'b', 'c']
    data_all.drop(sub, axis=1, inplace=True)
    return data_all


def indicator_4_qa(date, data):
    """Return calculated data for indicator 3."""
    indicators = config['indicator_mappings']['indicator_4']
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_c = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            name_c1 = "c{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_c = data[data['subindicator_id'].isin(
                [indicators['c']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            data_c.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_c[name_c1] = data_c['value']
                data_c = data_c[['district_id', name_c1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
                data_all = pd.merge(data_all, data_c, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                data_all[name_c1] = 0
                data_all['a2'] = 0
                data_all['b2'] = 0
                data_all['c2'] = 0
            if(_data != '0000'):
                _def_date = _data

    # calculation method

    data_all['perc_point'] = eval(
        config['indicator_mappings']['indicator_4_method_qa']).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_4'
    required_subindicators = [
        'a0',
        'a1',
        'a2',
        'b0',
        'b1',
        'b2',
        'c0',
        'c1',
        'c2']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    return data_all


def indicator_3_yr(date, data,indicator_id):
    indicators = config['indicator_mappings'][indicator_id]
    required_subindicators = [indicators[k] for k in indicators]
    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        name_b1 = "b{}".format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)

        data_a = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_b = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_a.drop_duplicates(inplace=True)
        data_b.drop_duplicates(inplace=True)
        if len(data_a) != 0:
            data_a[name_a1] = data_a['value']
            data_a = data_a[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a)

            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            data_all = pd.merge(data_all, data_b, on="district_id", how='outer')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)

    _def1 = 0.7 if indicator_id == 'indicator_31' else 0.3
    data_all['perc_point'] = ((data_all['a'] /
                                data_all['b']
                               )  *
                              100).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = indicator_id
    sub = _lista + _listb + ['a', 'b']
    data_all.drop(sub, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all


def indicator_3_qa(date, data, ind):
    """Return calculated data for indicator 3."""
    # genearting random data
    indicators = config['indicator_mappings'][ind]
    required_subindicators = [indicators[k] for k in indicators]

    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_a = pd.DataFrame()
    data_b = pd.DataFrame()
    data_all = pd.DataFrame()
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            data_a = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            data_b = data[data['subindicator_id'].isin(
                [indicators['b']]) & data['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            data_b.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a, on="district_id")
                else:
                    data_all = data_all.append(data_a)

                data_b[name_b1] = data_b['value']
                data_b = data_b[['district_id', name_b1]]
                data_all = pd.merge(data_all, data_b, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                # data_all['a2'] = 0
                # data_all['b2'] = 0
            if(_data != '0000'):
                _def_date = _data
    _def1 = 0.7 if ind == 'indicator_31' else 0.3
    data_all['perc_point'] = eval(
        (config['indicator_mappings'][ind+'_method_qa']).format(_def1)).fillna(0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = ind
    required_subindicators = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2']
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    # print(data_all)
    return data_all


def indicator_2_yr(date, data):
    """Return calculated data for indicator 2."""
    indicators = config['indicator_mappings']['indicator_2']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data_b = data[data['subindicator_id'].isin([indicators['b']]) & data[
        'date'].isin([current_fy])]
    data_c = data[data['subindicator_id'].isin([indicators['c']]) & data[
        'date'].isin([current_fy])]
    data_d = data[data['subindicator_id'].isin([indicators['d']]) & data[
        'date'].isin([current_fy])]
    count = len(date)
    data_b.drop_duplicates(inplace=True)
    data_c.drop_duplicates(inplace=True)
    data_d.drop_duplicates(inplace=True)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data.drop_duplicates(inplace=True)
    data_all = pd.DataFrame()
    _def_date = ""
    _listn = []
    _listd = []
    _lista = []
    for idx, _data in enumerate(date):
        name_a1 = "a{}".format(idx)
        num = 'N{}'.format(idx)
        den = 'D{}'.format(idx)
        _lista.append(name_a1)
        _listn.append(num)
        _listd.append(den)
        data_a1 = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_a1.drop_duplicates(inplace=True)
        if len(data_a1) != 0:
            data_a1[name_a1] = data_a1['value']
            data_b.rename(columns={'value': 'b'}, inplace=True)
            data_c.rename(columns={'value': 'c'}, inplace=True)
            data_d.rename(columns={'value': 'd'}, inplace=True)
            data_b = data_b[['district_id', 'b']]
            data_c = data_c[['district_id', 'c']]
            data_d = data_d[['district_id', 'd']]
            data_a1 = data_a1[['district_id', name_a1]]
            _def_date = _data
            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_a1, on="district_id", how='left')
            else:
                data_all = data_all.append(data_b)
                data_all = pd.merge(
                    data_all, data_a1, on="district_id").fillna(0)
                data_all = pd.merge(data_all, data_c, on="district_id", how='outer')
                data_all = pd.merge(data_all, data_d, on="district_id", how='outer')
            data_all[num] = data_all[name_a1] + \
                ((data_all['b'] - data_all['c']) * (data_all['d'] / 12) * count / 100)
            data_all[den] = data_all['d'] / 12 * count
        else:
            data_all[name_a1] = 0
    # import pdb; pdb.set_trace()
    # data_all['N'] = data_all[_lista].sum(axis=1)
    # data_all['D'] = data_all[_listd].sum(axis=1)
    data_all['perc_point'] = (data_all[_lista].sum(axis=1) + \
                ((data_all['b'] - data_all['c']) * (data_all['d'] / 12) * count / 100)) / (data_all['d'] / 12 * count) * 100
    data_all['date'] = _def_date
    data_all['indicator_id'] = 'indicator_2'
    sub = _lista + _listn + _listd + ['b', 'c', 'd']
    data_all.drop(sub, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    # import pdb; pdb.set_trace()
    return data_all


def indicator_2_qa(date, data):
    """Return calculated data for indicator 2."""
    indicators = config['indicator_mappings']['indicator_2']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date[0])
    data = data[data['subindicator_id'].isin(required_subindicators)]
    data.drop_duplicates(inplace=True)
    data_a1 = pd.DataFrame()
    data_all = pd.DataFrame()
    # count = len(set(list(map(int, date))) - set(data.date.unique()))
    count = len(date)
    # print("count number of months = ", count)
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            data_a1 = data[data['subindicator_id'].isin(
                [indicators['a']]) & data['date'].isin([_data])]
            # if(_data == '201903'):
            #     import pdb;pdb.set_trace()
            data_a1.drop_duplicates(inplace=True)
            if len(data_a1) != 0:
                data_a1[name_a1] = data_a1['value']
                data_a1 = data_a1[['district_id', name_a1]]
                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a1, on="district_id")
                else:
                    data_all = data_all.append(data_a1)
            else:
                data_all[name_a1] = 0
            if(_data != '0000'):
                _def_date = _data
    _def_yr = current_fy
    data = data[data['date'].isin([_def_yr])]
    data.drop_duplicates(inplace=True)
    data = data.pivot(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    # print(data_all)
    # print(count, date)
    # import pdb; pdb.set_trace()
    data_all = data_all.set_index('district_id')
    # data['D1'] = data[indicators['d']] / 12 * (count)
    # data['N1'] = (data_all['a0'] + \
    #     (data[indicators['b']] - data[indicators['c']]) * (data[indicators['d']] / 12) * (count) / 100)
    if count == 1:
        data_all['a_all'] = data_all[['a0']].sum(axis=1)
        # data['N2'] = 0
        # data['D2'] = 0
        # data['N3'] = 0
        # data['D3'] = 0
    elif count == 2:
        data_all['a_all'] = data_all[['a0']].sum(axis=1)
        # data['N2'] = (data_all['a1'] + \
        #     (data[indicators['b']] - data[indicators['c']]) * (data[indicators['d']] / 12) * (count) / 100)
        # data['D2'] = data['D1']
        # data['N3'] = 0
        # data['D3'] = 0
    else:
        data_all['a_all'] = data_all[['a0', 'a1', 'a2']].sum(axis=1)
        # data['N2'] = (data_all['a1'] + \
        #     (data[indicators['b']] - data[indicators['c']]) * (data[indicators['d']] / 12) * (count) / 100)
        # data['N3'] = (data_all['a2'] + \
        #     (data[indicators['b']] - data[indicators['c']]) * (data[indicators['d']] / 12) * (count) / 100)
        # data['D3'] = data['D1']
        # data['D2'] = data['D1']
    # data['perc_point'] = eval(
    #     config['indicator_mappings']['indicator_2_method_qa'])
    data['perc_point'] = (data_all['a_all'] + \
    ((data[indicators['b']] - data[indicators['c']]) * (data[indicators['d']] / 12) * (count) / 100)) / (data[indicators['d']] / 12 * (count))*100
    data['date'] = _def_date
    data['indicator_id'] = 'indicator_2'
    data.drop([indicators['b'],
              indicators['c'], indicators['d']], axis=1, inplace=True)
    # data.drop(['N1', 'N2', 'N3', 'D1', 'D2', 'D3', indicators['b'],
    #            indicators['c'], indicators['d']], axis=1, inplace=True)
    data = data.reset_index()
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_1_yr(date, data):
    indicators = config['indicator_mappings']['indicator_1']
    required_subindicators = [k for k in indicators.values()]
    current_fy = get_fy(date[0])
    data_c = data[data['subindicator_id'].isin([indicators['c']]) & data[
        'date'].isin([current_fy])]
    data_c.drop_duplicates(inplace=True)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin(date)]
    data_all = pd.DataFrame()
    _def_date = ""
    _lista = []
    _listb = []
    for idx, _data in enumerate(date):
        name_a1 = 'a{}'.format(idx)
        name_b1 = 'b{}'.format(idx)
        _lista.append(name_a1)
        _listb.append(name_b1)
        data_a1 = data[data['subindicator_id'].isin(
            [indicators['a']]) & data['date'].isin([_data])]
        data_a1.drop_duplicates(inplace=True)
        data_b1 = data[data['subindicator_id'].isin(
            [indicators['b']]) & data['date'].isin([_data])]
        data_b1.drop_duplicates(inplace=True)
        # import pdb; pdb.set_trace()
        if len(data_a1) != 0:
            data_a1[name_a1] = data_a1['value']
            data_a1 = data_a1[['district_id', name_a1]]

            if len(data_all) != 0:
                data_all = pd.merge(data_all, data_a1, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_a1)

            data_b1[name_b1] = data_b1['value']
            data_b1 = data_b1[['district_id', name_b1]]
            data_all = pd.merge(data_all, data_b1, on="district_id", how='outer')
            _def_date = _data
        else:
            data_all[name_a1] = 0
            data_all[name_b1] = 0
    data_c['c'] = data_c['value']
    data_c = data_c[['district_id', 'c']]
    data_all['a'] = data_all[_lista].sum(axis=1)
    data_all['b'] = data_all[_listb].sum(axis=1)
    data_all = data_all.merge(data_c)
    data_all['date'] = _def_date
    # import pdb; pdb.set_trace()
    indicator_qa_formula = config['indicator_mappings']['indicator_1_method_yr'].format(len(date), len(date))
    data_all['perc_point'] = eval(
        indicator_qa_formula)
    data_all['indicator_id'] = 'indicator_1'
    sub = _lista + _listb + ['a', 'b', 'c']
    data_all.drop(sub, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all


def indicator_1_qa(date, data):
    """Return calculated data for indicator 1."""
    indicators = config['indicator_mappings']['indicator_1']
    # mak = date
    current_fy = get_fy(date[0])
    # mak = mak.append(current_fy)
    required_subindicators = [k for k in indicators.values()]
    data = data[data['subindicator_id'].isin(required_subindicators)]

    data_a1 = pd.DataFrame(columns=['district_id'])
    data_b1 = pd.DataFrame(columns=['district_id'])
    data_c = pd.DataFrame(columns=['district_id'])
    data_all = pd.DataFrame(columns=['district_id'])
    _def_date = ""
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        if idx != 3:
            name_a1 = "a{}".format(idx)
            name_b1 = "b{}".format(idx)
            data_a1 = data[data['subindicator_id'].isin(
                [required_subindicators[0]]) & data['date'].isin([_data])]
            data_a1.drop_duplicates(inplace=True)
            data_b1 = data[data['subindicator_id'].isin(
                [required_subindicators[1]]) & data['date'].isin([_data])]
            data_b1.drop_duplicates(inplace=True)
            if len(data_a1) != 0:
                data_a1[name_a1] = data_a1['value']
                data_a1 = data_a1[['district_id', name_a1]]

                if len(data_all) != 0:
                    data_all = pd.merge(data_all, data_a1, on="district_id")
                else:
                    data_all = data_all.append(data_a1)

                data_b1[name_b1] = data_b1['value']
                data_b1 = data_b1[['district_id', name_b1]]
                data_all = pd.merge(data_all, data_b1, on="district_id")
            else:
                data_all[name_a1] = 0
                data_all[name_b1] = 0
                data_all['a2'] = 0
                data_all['b2'] = 0
            if(_data != '0000'):
                _def_date = _data
    data_c = data[data['subindicator_id'].isin(
        [required_subindicators[2]]) & data['date'].isin([current_fy])]
    data_c.drop_duplicates(inplace=True)
    data_c['c'] = data_c['value']
    data_c = data_c[['district_id', 'c']]
    data_all = pd.merge(data_all, data_c, on="district_id")
    # import pdb; pdb.set_trace()
    # if('201903' in date):
    #     date = ['201901','201902']
    indicator_qa_formula = config['indicator_mappings']['indicator_1_method_qa'].format(len(date), len(date))
    # if('201904' in date):
    #     import pdb; pdb.set_trace()
    data_all['perc_point'] = eval(indicator_qa_formula)
    data_all['date'] = _def_date
    required_subindicators = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2', 'c']
    data_all['indicator_id'] = 'indicator_1'
    data_all.drop(required_subindicators, axis=1, inplace=True)
    data_all.loc[data_all['perc_point'] > 100, 'perc_point'] = 100
    return data_all


def indicator_1(date, data, map):
    """Return calculated data for indicator 1."""
    indicators = config[map]['indicator_1']
    required_subindicators = [k for k in indicators.values()]
    current_fy = get_fy(date)
    # import pdb;
    # pdb.set_trace();
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    data['perc_point'] = eval(
        config[map]['indicator_1_method']).replace(np.inf, 0)
    data['date'] = date

    data['indicator_id'] = 'indicator_1'
    # # breakpoint()
    data.drop(required_subindicators, axis=1, inplace=True)
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_2(date, data, map):
    """Return calculated data for indicator 2."""
    indicators = config[map]['indicator_2']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    # # breakpoint()
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    # # breakpoint()

    data['perc_point'] = eval(
        config[map]['indicator_2_method']).replace(np.inf, 0)
    data['date'] = date
    data['indicator_id'] = 'indicator_2'
    data.drop(required_subindicators, axis=1, inplace=True)
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_3(date, data, map):
    """Return calculated data for indicator 3."""
    # genearting random data
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    # import pdb; pdb.set_trace();
    # # breakpoint()
    indicators = config[map]['indicator_3']
    required_subindicators = [indicators[k] for k in indicators]
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    # # breakpoint()

    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value'
        ).fillna(0)
    # # breakpoint()
    data['perc_point'] = eval(
        config[map]['indicator_3_method']).fillna(0).replace(np.inf, 0)
    data['date'] = date
    data['indicator_id'] = 'indicator_3'
    data.drop(required_subindicators, axis=1, inplace=True)
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_31(date, data, map):
    """Return calculated data for indicator 3."""
    # genearting random data
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    indicators = config[map]['indicator_31']
    required_subindicators = [indicators[k] for k in indicators]
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    data['perc_point'] = eval(
        config[map]['indicator_31_method']).fillna(0)
    data['date'] = date
    data['indicator_id'] = 'indicator_31'
    data.drop(required_subindicators, axis=1, inplace=True)
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_32(date, data, map):
    """Return calculated data for indicator 3."""
    # genearting random data
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    indicators = config[map]['indicator_32']
    required_subindicators = [indicators[k] for k in indicators]
    # data = pd.read_csv('data/indicator_3_data.csv', encoding='utf-8')
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    data['perc_point'] = eval(config[map]['indicator_32_method']).fillna(0)
    data['date'] = date
    data['indicator_id'] = 'indicator_32'
    data.drop(required_subindicators, axis=1, inplace=True)
    #replacing infinity with 0
    data.replace([np.inf, -np.inf], 0, inplace=True)
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_4(date, data, map):
    """Return calculated data for indicator 3."""
    indicators = config[map]['indicator_4']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    data['perc_point'] = eval(
        config[map]['indicator_4_method'])
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_4'
    # data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_5(date, data, map):
    """Return calculated data for indicator 5."""
    indicators = config[map]['indicator_5']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    data['perc_point'] = eval(
        config[map]['indicator_5_method']).replace(np.inf, 0)
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_5'
    data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_6(date, data, map):
    """Return calculated data for indicator 6."""
    indicators = config[map]['indicator_6']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    data['perc_point'] = eval(
        config[map]['indicator_6_method']).replace(np.inf, 0)
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_6'
    # data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_7(date, data, map):
    """Return calculated data for indicator 7."""
    indicators = config[map]['indicator_7']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(
        required_subindicators) & data['date'].isin([date, current_fy])]
    # import pdb; pdb.set_trace()
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    # if date == '201810':
    # import pdb; pdb.set_trace()
    try:
        data['perc_point'] = eval(
            config[map]['indicator_7_method']).replace(np.inf, 0)
        data.drop(required_subindicators, axis=1, inplace=True)
        data['date'] = date
        data['indicator_id'] = 'indicator_7'
        data.loc[data['perc_point'] > 100, 'perc_point'] = 100
        # import pdb; pdb.set_trace()
        return data
    except KeyError:
        return pd.DataFrame()


def indicator_8(date, data, map):
    """Return calculated data for indicator 8."""
    indicators = config[map]['indicator_8']
    required_subindicators = [indicators[k] for k in indicators]
    # import pdb; pdb.set_trace()
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    # import pdb; pdb.set_trace()
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value'
        ).fillna(0)
    # import pdb; pdb.set_trace()
    # calculation method
    data['perc_point'] = eval(
        config[map]['indicator_8_method']).replace(np.inf, 0)

    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_8'
    # data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_9(date, data, map):
    """Return calculated data for indicator 9."""
    indicators = config[map]['indicator_9']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    data['perc_point'] = eval(
        config[map]['indicator_9_method']).replace(np.inf, 0)
    # data['perc_point'] = data['perc_point'] * 100
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_9'
    # data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    return data


def indicator_10(date, data, map):
    """Return calculated data for indicator 10."""
    prev_date = get_prev_month_tb(date)
    date_list = [prev_date, date]
    # # breakpoint()

    indicators = config[map]['indicator_10']

    _subindicators = [k for k in indicators.values()]  # ['YEbwZRpntxW', 'RW3tc5FKbgy']

    sub_dict_rev = {v: k for k, v in indicators.items()}  # {'YEbwZRpntxW': 'a', 'RW3tc5FKbgy': 'b'}

    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)

    # data_monthly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin(date_list)]
    # data_yearly = data[data['subindicator_id'].isin(_subindicators) & data['date'].isin([current_fy])]

    data_monthly = data[(data['subindicator_id'] == "B2A7x36qEry.Ti9FJqkSK6J") & (data['date'].isin(date_list))] #numerator
    data_yearly = data[(data['subindicator_id'] == "GXgfTS67qxe.Ti9FJqkSK6J") & (data['date'].isin([date])) ] # denominator. is also monthly. but using same variable.
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)

    sub_period_df = sub_indicator_df[sub_indicator_df['subindicator_id'].isin(_subindicators)]
    sub_a = sub_period_df[sub_period_df['subindicator_id'] == 'B2A7x36qEry.Ti9FJqkSK6J']['subindicator_id'].unique().tolist()
    sub_b = sub_period_df[sub_period_df['subindicator_id'] == 'GXgfTS67qxe.Ti9FJqkSK6J']['subindicator_id'].unique().tolist()

    # sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_yearly)]  # ['a']
    # sub_yearly = sub_period_df[sub_period_df['period'] == 'yearly']['subindicator_id'].unique().tolist()  # ['RW3tc5FKbgy']
    sub_monthly = [sub_dict_rev[k] for k in sub_dict_rev.keys() if(k not in sub_b)]  # ['a']
    sub_yearly = sub_b  # ['GXgfTS67qxe.Ti9FJqkSK6J']

    newdf = pd.DataFrame()

    temp_date = ""
    list_a = []
    data_total = pd.DataFrame()
    key_dict = defaultdict(list)
    # # breakpoint()
    for i, _date_ in enumerate(date_list):
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
            temp_date = date  # 201909
    # end of for loop 1

    for key in sub_yearly:  # ['RW3tc5FKbgy']
        sub_pseudo_b = "{}".format(sub_dict_rev[key])  # b
        list_a.append(sub_pseudo_b)  # ['a0', 'a1', 'a2', 'a3', 'a', b]

        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([date])]
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


    data_total = data_total.set_index('district_id')

    # data = data.pivot(
    #     index='district_id',
    #     columns='subindicator_id',
    #     values='value').fillna(0)

    # data_total['perc_point'] = eval("(data_total['a1'] - data_total['a0']) / (data_total['b'] / 12)") * 100
    # breakpoint()
    month_date = int(prev_date) % 100

    if month_date == 12:
        print("change formula")
        formula = "((data_total['a1']) / ( data_total['b'])) * 100 "
        data_total['perc_point'] = eval(formula)
    else:
        data_total['perc_point'] = eval(config[map]['indicator_10_method'])

    # data_total['perc_point'] = eval(config[map]['indicator_10_method'])
    data_total['date'] = temp_date  # append last date in range
    data_total['indicator_id'] = 'indicator_10'
    # Drop pseudo columns and retain only 'per point' column
    data_total.drop(list_a, axis=1, inplace=True)
    # # breakpoint()
    data_total.loc[data_total['perc_point'] > 100, 'perc_point'] = 100
    return data_total

def indicator_10_block(date, data, map):
    """Return calculated data for indicator 10."""

    indicators = config[map]['indicator_10']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    # calculation method
    try:
        data['perc_point'] = eval(config[map]['indicator_10_method']).replace(np.inf, 0)
        data.drop(required_subindicators, axis=1, inplace=True)
        data['date'] = date
        data['indicator_id'] = 'indicator_10'
        data.loc[data['perc_point'] > 100, 'perc_point'] = 100
        return data
    except KeyError:
        return newdf

def indicator_11(date, data, map):
    # This indicator is called in both block and district script
    # In block - 11 refers to asha incentive
    # In distict - 11 refers to HIV screened

    # When block - asha incentive
    # formula (12a current month - 12a previous month)*100000/12b
    # if month is April, should be (April-Zero) else ( current month - previous month )

    """Return calculated data for indicator 11."""

    # Get previous month '201912' ==> '201911'
    curr_date = datetime.strptime(date, '%Y%m') # convert string to date
    prev_date = curr_date - dateutil.relativedelta.relativedelta(months=1) # subtract 1 month
    prev_date = prev_date.strftime('%Y%m')
    print("prev_date",prev_date)
    indicators = config[map]['indicator_11']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)

    # Block level 11 refers to asha incentive
    if(map == 'indicator_mappings_block'):

        # Sub indicator A (A_curr - A_prev)
        data_curr_a = data[data['subindicator_id'].isin([required_subindicators[0]]) & data['date'].isin([date, prev_date])]
        # Fetches block data for previous time period for Asha indicator
        data_prev_a = get_asha_prev_block(prev_date)
        data_a = pd.concat([data_curr_a, data_prev_a])
        data_a1 = pd.pivot_table(data_a, index=['district_id', 'district'], columns='date', values='value').fillna(0).reset_index()
        data_a1['value']= data_a1[int(date)] - data_a1[int(prev_date)]
        data_a1 = data_a1[['district_id', 'district', 'value']]
        data_a1['subindicator_id'] = required_subindicators[0]
        data_a1['date'] = int(date)

        # Sub indicator B
        data_b = data[data['subindicator_id'].isin([required_subindicators[1]]) & data[
            'date'].isin([date])]

        # If month is not april, then subtraction
        if (date[-2:] != '04'):
            # Concat A and B frames
            data = pd.concat([data_a1, data_b])
        else:
            data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin([date])]

    # District level 11 refers to HIV screened
    elif (map != 'indicator_mappings_block'):
        data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin([date, current_fy])]


    data.drop_duplicates(inplace=True)

    # Return an empty df if the 'a' or 'b' sub indicator is missing from data
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    if len(data[data['subindicator_id'] == indicators['b']]) == 0:
        return newdf
    
    data.drop_duplicates(inplace=True)
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value'
        ).fillna(0)

    # calculation method
    if(map == 'indicator_mappings_block'):
        data['perc_point'] = eval(
            config[map]['indicator_11_method']).replace(np.inf, 0)
    else:
        data['perc_point'] = eval(
            config[map]['indicator_11_method']).replace(np.inf, 0)
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_11'
    if(map != 'indicator_mappings_block'):
        data.loc[data['perc_point'] > 100, 'perc_point'] = 100
    # import pdb; pdb.set_trace()
    return data


def indicator_12(date, data, map):

    # This indicator is called in both block and district script
    # In block - 12 refers to Availaibity Asha
    # In distict - 12 refers to incentive Asha

    # When district -  asha incentive
    # formula (12a current month - 12a previous month)*100000/12b
    # if month is April, should be (April-Zero) else ( current month - previous month )
    """Return calculated data for indicator 12."""

    # Get previous month '201912' ==> '201911'
    curr_date = datetime.strptime(date, '%Y%m') # convert string to date
    prev_date = curr_date - dateutil.relativedelta.relativedelta(months=1) # subtract 1 month
    prev_date = prev_date.strftime('%Y%m')

    indicators = config[map]['indicator_12']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)

    # District level 12 refers to asha incentive
    if(map != 'indicator_mappings_block'):

        # Sub indicator A (A_curr - A_prev)
        data_curr_a = data[data['subindicator_id'].isin([required_subindicators[0]]) & data[
            'date'].isin([date, prev_date])]

        # Fetches block data for previous time period for Asha indicator
        data_prev_a = get_asha_prev_block(prev_date)
        data_a = pd.concat([data_curr_a, data_prev_a])

        data_a1 = pd.pivot_table(data_a, index=['district_id', 'district'], columns='date', values='value').fillna(0).reset_index()
        data_a1['value']= data_a1[int(date)] - data_a1[int(prev_date)]
        data_a1 = data_a1[['district_id', 'district', 'value']]
        data_a1['subindicator_id'] = required_subindicators[0]
        data_a1['date'] = int(date)

        # Sub indicator B
        data_b = data[data['subindicator_id'].isin([required_subindicators[1]]) & data[
            'date'].isin([date])]

        # If month is not april, then subtraction
        if (date[-2:] != '04'):
            # Concat A and B frames
            data = pd.concat([data_a1, data_b])
        else:
            data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin([date])]

    # District level 12 refers to Availability Asha
    elif (map == 'indicator_mappings_block'):
        data = data[data['subindicator_id'].isin(required_subindicators) & data['date'].isin([date, current_fy])]

    data.drop_duplicates(inplace=True)

    # Return an empty df if the 'a' or 'b' sub indicator is missing from data
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    if len(data[data['subindicator_id'] == indicators['b']]) == 0:
        return newdf

    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    # data['perc_point'] = eval(
    #     config[map]['indicator_12_method']).replace(np.inf, 0)
    data['perc_point'] = eval(config[map]['indicator_12_method'])
    data = data.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    # data.drop(data.index[data['perc_point'] == np.inf], inplace=True)
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_12'
    return data


def indicator_131(date, data, map):
    """Return calculated data for indicator 13."""
    indicators = config[map]['indicator_13']
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    data.drop_duplicates(inplace=True)
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    if len(data[data['subindicator_id'] == indicators['b']]) == 0:
        return newdf

    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)
    # .fillna(0)
    # import pdb; pdb.set_trace()

    # calculation method
    # import pdb; pdb.set_trace()
    data['perc_point'] = eval(
        config[map]['indicator_13_method'])
    data.drop(required_subindicators, axis=1, inplace=True)
    data['date'] = date
    data['indicator_id'] = 'indicator_13'
    data = data.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    # data.drop(data.index[data['perc_point'] == np.inf], inplace=True)
    return data


def indicator_141(date, data, map):
    """Return calculated data for indicator 13."""
    indicators = config[map]['indicator_14']
    print("------------------------------------>")
    print(data,map)
    print("-------------------------=$$$$$$$$$$$$----------->")
    print(indicators)
    required_subindicators = [indicators[k] for k in indicators]
    current_fy = get_fy(date)
    data = data[data['subindicator_id'].isin(required_subindicators) & data[
        'date'].isin([date, current_fy])]
    print("------------------------------------>")
    print(data)
    data.drop_duplicates(inplace=True)
    newdf = pd.DataFrame()
    if len(data[data['subindicator_id'] == indicators['a']]) == 0:
        return newdf
    data = data.reset_index().pivot_table(
        index='district_id',
        columns='subindicator_id',
        values='value').fillna(0)

    # calculation method
    print("-------------------------===============--->")
    print(data,map)
    data['perc_point'] = eval(
        config[map]['indicator_14_method'])
    data.drop(required_subindicators, axis=1, inplace=True)
    data = data.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    data['date'] = date
    data['indicator_id'] = 'indicator_14'
    return data


def calculate_indicator_index(df):
    """Return calculated indicator index."""
    def calculate_score(x):
        if (x['calc_type'] == 'p'):
            if (x['max'] - x['min']) != 0:
                # print ((x['perc_point'] - x['min']) / (x['max'] - x['min']), "p")
                return (x['value'] - x['min']) / (x['max'] - x['min'])
            else:
                return 0
        elif (x['calc_type'] == 'n'):
            if (x['max'] - x['min']) != 0:
                # print ((x['max'] - x['perc_point']) / (x['max'] - x['min']), 'n')
                return (x['max'] - x['value']) / (x['max'] - x['min'])
            else:
                return 0

    # For ind 31, 31 for districts - multiply perc point by 0.7, 0.3 respectively
    # ------------- uncomment --------
    df['value'] = df['perc_point']
    df.loc[df.indicator_ids == 'indicator_31', 'value'] = df['value']*0.7
    df.loc[df.indicator_ids == 'indicator_32', 'value'] = df['value']*0.3

    # import pdb; pdb.set_trace()

    # Summing up the c1 and c2 c-section values
    c1 = df.loc[df.indicator_ids == 'indicator_31']
    c2 = df.loc[df.indicator_ids == 'indicator_32']
    c3 = c1.append(c2)
    sum_df = c3.groupby(['district','district_id', 'date']).sum().reset_index()[['district', 'value']]

    c1 = c1.drop('value', axis =1)
    c2 = c2.drop('value', axis =1)
    # pdb.set_trace();
    # import pdb;
    # pdb.set_trace();

    # Adds summed column
    c1 = pd.merge(c1, sum_df, on= ['district'], how= 'inner')
    c2 = pd.merge(c2, sum_df, on= ['district'], how= 'inner')
    c1_c2 = c1.append(c2)
    # pdb.set_trace();

    non_csection = df.loc[~df['indicator_ids'].isin(['indicator_31', 'indicator_32'])]
    all_df = non_csection.append(c1_c2)
    #--------------- up to here -----------

    # temp_df = df.groupby(['date', 'indicator_id'])['value'].agg(
    #     {'min': 'min', 'max': 'max'}).reset_index()
    # df = pd.merge(df, temp_df, on=['date', 'indicator_id'])
    # df.loc[:, 'indicator_index'] = df.apply(calculate_score, axis=1)
    # del df['min']
    # del df['max']
    # return df



    # Finding min and max values
    temp_df = all_df.groupby(['date', 'indicator_id'])['value'].agg(
        {'min': 'min', 'max': 'max'}).reset_index()
    all_df = pd.merge(all_df, temp_df, on=['date', 'indicator_id'])
    all_df.loc[:, 'indicator_index'] = all_df.apply(calculate_score, axis=1)
    del all_df['min']
    del all_df['max']
    return all_df



def calculate_indicator_index_block(df):
    """Return calculated indicator index."""
    def calculate_score(x):
        if (x['calc_type'] == 'p'):
            if (x['max'] - x['min']) > 0:
                # print ((x['perc_point'] - x['min']) / (x['max'] - x['min']), "p")
                return (x['perc_point'] - x['min']) / (x['max'] - x['min'])
            else:
                return 0
        elif (x['calc_type'] == 'n'):
            if (x['max'] - x['min']) > 0:
                # print ((x['max'] - x['perc_point']) / (x['max'] - x['min']), "n")
                return (x['max'] - x['perc_point']) / (x['max'] - x['min'])
            else:
                return 0
    df.replace([np.inf, -np.inf], 0, inplace=True)
    temp_df = df.groupby(['date', 'indicator_id'])['perc_point'].agg(
        {'min': 'min', 'max': 'max'}).reset_index()
    df = pd.merge(df, temp_df, on=['date', 'indicator_id'])
    df.loc[:, 'indicator_index'] = df.apply(calculate_score, axis=1)
    del df['min']
    del df['max']
    return df


def calculate_type_index(df):
    """Return calculated type index."""
    def calculate_score(x):
        return x['sum'] / config['type']['denoms'][x['type']]

    # import pdb; pdb.set_trace()
    temp_df = df.loc[~df['indicator_ids'].isin(['indicator_32'])]
    temp_df = temp_df.groupby(['date', 'type', 'district'])[
        'indicator_index'].agg({'sum', 'sum'}).reset_index()
    df = pd.merge(df, temp_df, on=['date', 'district', 'type'])
    df.loc[:, 'type_index'] = df.apply(calculate_score, axis=1)
    del df['sum']
    return df


def calculate_type_index_block(df):
    """Return calculated type index."""
    def calculate_score(x):
        return x['sum'] / config['type_block']['denoms'][x['type']]

    temp_df = df.groupby(['date', 'type', 'uid_district', 'block'])[
        'indicator_index'].agg({'sum', 'sum'}).reset_index()
    df = pd.merge(df, temp_df, on=['date', 'uid_district', 'block', 'type'])
    df.loc[:, 'type_index'] = df.apply(calculate_score, axis=1)
    del df['sum']
    return df


def calculate_domain_index_block(df):
    """Return calculated domain index."""
    def calculate_score(x):
        return x['sum'] / config['domain_block']['denoms'][x['domain']]

    temp_df = df.groupby(['date', 'domain', 'uid_district', 'block'])[
        'indicator_index'].agg({'sum', 'sum'}).reset_index()
    df = pd.merge(df, temp_df, on=['date', 'uid_district', 'block', 'domain'])
    df.loc[:, 'domain_index'] = df.apply(calculate_score, axis=1)
    del df['sum']
    return df


def calculate_domain_index(df):
    """Return calculated domain index."""
    def calculate_score(x):
        return x['sum'] / config['domain']['denoms'][x['domain']]

    temp_df = df.groupby(['date', 'domain', 'district'])[
        'indicator_index'].agg({'sum', 'sum'}).reset_index()
    df = pd.merge(df, temp_df, on=['date', 'district', 'domain'])
    df.loc[:, 'domain_index'] = df.apply(calculate_score, axis=1)
    del df['sum']
    return df


def calculate_compostite_score_block(df):
    """Return calculated composite score."""
    # print("innnnnnnnnnnn")
    try:
        def calculate_score(x):
            temp_df = df.groupby(['date', 'uid_district', 'block_id', 'type'], as_index=False)[
                'type_index'].mean()
            temp_df = temp_df[temp_df['date'].isin([x['date']]) & temp_df[
                'block_id'].isin([x['block_id']])]
            var_a = ['coverage', 'quality', 'availability']
            var_b = ['data_quality']
            const_1 = 0.8
            const_2 = 0.2
            # print(x['date'])
            num = (((temp_df[temp_df['type'].isin(var_a)]['type_index'].sum() / 3) * const_1) +
                (temp_df[temp_df['type'].isin(var_b)]['type_index'].mean() * const_2))
            if np.isnan(num):
                # print("num---", num)
                # print('i am in if condition 2222222222222222222222')
                # print((temp_df[temp_df['type'].isin(var_a)]['type_index'].sum() / 2) * const_1)
                return (temp_df[temp_df['type'].isin(var_a)]['type_index'].sum() / 2) * const_1
            return num

        df.loc[:, 'composite_index'] = df.apply(calculate_score, axis=1)
        # print("done")
        return df
    except Exception as e:
        print(e)
        print(traceback.print_exc()) 

# def calculate_compostite_score_block(df):
#     try:
#         var_a = ['coverage', 'quality', 'availability']
#         var_b = ['data_quality']
#         const_1 = 0.8
#         const_2 = 0.2

#         temp_df = df.groupby(['date', 'uid_district', 'block_id', 'type'], as_index=False)['type_index'].mean()

#         def calculate_score(x):
#             x.to_csv('values_of_x.csv')
#             num_a = temp_df[(temp_df['type'].isin(var_a)) & 
#                             (temp_df['date'] == x['date']) & 
#                             (temp_df['block_id'] == x['block_id'])]['type_index'].sum() / 3
            
#             num_b = temp_df[(temp_df['type'].isin(var_b)) & 
#                             (temp_df['date'] == x['date']) & 
#                             (temp_df['block_id'] == x['block_id'])]['type_index'].mean()

#             num = ((num_a * const_1) + (num_b * const_2)) if not np.isnan(num_a) else (num_a / 2) * const_1
#             return num

#         df['composite_index'] = df.apply(calculate_score, axis=1)
        
#         return df

#     except Exception as e:
#         print(e)
#         return None



def calculate_compostite_score(df):
    """Return calculated composite score."""
    def calculate_score(x):
        temp_df = df.groupby(['date', 'district_id', 'type'], as_index=False)[
            'type_index'].mean()
        temp_df = temp_df[temp_df['date'].isin([x['date']]) & temp_df[
            'district_id'].isin([x['district_id']])]
        var_a = ['coverage', 'quality', 'availability']
        var_b = ['data_quality']
        const_1 = 0.8
        const_2 = 0.2
        num = (((temp_df[temp_df['type'].isin(var_a)][
            'type_index'].sum() / 12) * const_1) + (temp_df[temp_df['type'].isin(var_b)][
                'type_index'].mean() * const_2))
        if np.isnan(num):
            return (temp_df[temp_df['type'].isin(var_a)]['type_index'].sum() / 12) * const_1
        return num
    df.loc[:, 'composite_index'] = df.apply(calculate_score, axis=1)
    return df


def calculate_ranks(df):
    """Return calculated ranks for composite, type, domain and indicator rank."""
    df['composite_rank'] = df.groupby('date')['composite_index'].rank(
        method='dense', ascending=False)
    df['type_rank'] = df.groupby(['date', 'type'])['type_index'].rank(
        method='dense', ascending=False)
    df['domain_rank'] = df.groupby(['date', 'domain'])[
        'domain_index'].rank(method='dense', ascending=False)
    df['indicator_rank'] = df.groupby(['date', 'indicator_id'])[
        'indicator_index'].rank(method='dense', ascending=False)
    return df


# def fetch_data(url, indicator_mapping):
#     """Make a http request and return data dictionary."""
#     try:
#         if indicator_mapping == 'indicator_13_14':
#             resp = requests.get(url,
#                                 auth=requests.auth.HTTPBasicAuth('Gramener', 'Gramener@123'),
#                                 headers={'content-type': 'application/json'})
#         else:
#             resp = requests.get(url, verify=False,
#                                 headers={'content-type': 'application/json'})
#         return json.loads(resp.text)
#     except Exception:
#         _data = pd.DataFrame([url], columns=['urls'])
#         if os.path.exists("error_url.csv"):
#             _data.to_csv("error_url.csv", header=False, mode="a", index=False,
#                          encoding='utf-8')
#         else:
#             _data.to_csv("error_url.csv", index=False, encoding='utf-8')
#         return {}
#         # continue


# nodata_subindicator_list_district = list()
# nodata_subindicator_list_block = list()


# def get_row_dict(data, date, i_type='all'):
#     """Filter the data and returns row dictionary."""
#     # import pdb; pdb.set_trace()
#     dict_list = list()
#     # df = pd.DataFrame()
#     try:
#         if (len(data['rows']) != 0):
#             if (len(data['rows'][0]) == 3):
#                 for d in data['rows']:
#                     try:
#                         dic_ = data['metaData']['names']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]].strip(),
#                             'value': d[2]
#                         })
#                     except KeyError:
#                         dic_ = data['metaData']['items']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]]['name'].strip(),
#                             'value': d[2]
#                         })
#                 return dict_list
#             elif (len(data['rows'][0]) == 4):
#                 for d in data['rows']:
#                     try:
#                         dic_ = data['metaData']['names']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]].strip(),
#                             'value': d[3]
#                         })
#                     except KeyError:
#                         dic_ = data['metaData']['items']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]]['name'].strip(),
#                             'value': d[3]
#                         })
#                 df = pd.DataFrame(dict_list)
#                 if (i_type != 'one'):
#                     df = pd.merge(df,
#                                   organisation_unit[
#                                       ['district', 'district_id']] .drop_duplicates(),
#                                       on='district_id', how='outer')
#                     df.rename(columns={'district_y': 'district'}, inplace=True)
#                     df['date'] = date
#                     del df['district_x']
#                 return df.fillna(0)
#     except KeyError:
#         return dict_list

# def get_row_dict_2(data, date, i_type='all'):
#     """Filter the data and returns row dictionary."""
#     dict_list = list()
#     # df = pd.DataFrame()
#     # import pdb;pdb.set_trace()
#     try:
#         if (len(data['rows']) != 0):

#             if (len(data['rows'][0]) == 3):
#                 import pdb; pdb.set_trace();
#                 for d in data['rows']:
#                     try:
#                         dic_ = data['metaData']['names']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]].strip(),
#                             'value': d[2]
#                         })
#                     except KeyError:
#                         dic_ = data['metaData']['items']
#                         dict_list.append({
#                             'date': date,
#                             'subindicator_id': d[0],
#                             'district_id': d[1],
#                             'district': dic_[d[1]]['name'].strip(),
#                             'value': d[2]
#                         })
#                 return dict_list
#             elif (len(data['rows'][0]) == 4):
#                 # import pdb; pdb.set_trace();
#                 for d in data['rows']:
#                     # try:
#                     # dic_ = data['metaData']['names']
#                     dict_list.append({
#                         'date': date,
#                         'subindicator_id': 'aRueVYr35yM.Ti9FJqkSK6J',
#                         'district_id': d[2],
#                         'district': '',
#                         'value': d[3]
#                     })
#                     # except KeyError:

#                         # dic_ = data['metaData']['items']
#                         # dict_list.append({
#                         #     'date': date,
#                         #     'subindicator_id': d[0],
#                         #     'district_id': d[1],
#                         #     'district': dic_[d[1]]['name'].strip(),
#                         #     'value': d[3]
#                         # })
#                 df = pd.DataFrame(dict_list)
#                 if (i_type != 'one'):
#                     df = pd.merge(df,
#                                   organisation_unit[
#                                       ['district', 'district_id']] .drop_duplicates(),
#                                       on='district_id', how='outer')
#                     df.rename(columns={'district_y': 'district'}, inplace=True)
#                     df['date'] = date
#                     del df['district_x']
#                 return df.fillna(0)
#     except KeyError:
#         return dict_list

# def fetch_district_data(dates,year_dates, base_url, district_ids):
#     """Fetching district level data."""
#     print("dates",dates)
#     print("year_dates", year_dates)
#     logger.info('*' * 10 + 'fetching district data' + '*' * 10)
#     df_district = pd.DataFrame()
#     # import pdb;
#     # pdb.set_trace();
#     # fetching monthly data
#     for date in dates:
#         print(date)
#         temp_df = pd.DataFrame()
#         for index, row in (sub_indicator_df[
#                 sub_indicator_df['period'].isin(['monthly']) &
#                 sub_indicator_df['indicator_type'].isin(['indicator'])]
#                 .drop_duplicates().iterrows()):
#             print(row['subindicator_id'])
#             subindicator_id = row['subindicator_id']
#             period = row['period']
#             indicator_type = row['indicator_type']
#             if (period == 'monthly' and indicator_type == 'indicator'):
#                 param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#                     .format(subindicator_id, district_ids, date)
#                 url = base_url + param_url
#             data = fetch_data(url, '')
#             # if len(data) != 0:
#             temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
#             nodata_subindicator_list_district.append({'subindicator_id': subindicator_id,
#                                                       'date': date,
#                                                       'number_of_districts': len(data['rows'])})
#         # temp_df.drop(temp_df.query('subindicator_id == "aRueVYr35yM.Ti9FJqkSK6J"').index, inplace=True)
#         temp_df = temp_df[temp_df['subindicator_id'] != 'aRueVYr35yM.Ti9FJqkSK6J']

#         param_url = "?dimension=dx:aRueVYr35yM.Ti9FJqkSK6J&dimension=aDI5f2TIgXx:mgnmdIRKpzA&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#             .format(district_ids, date)
#         url = base_url + param_url
#         # breakpoint()

#         data = fetch_data(url, '')
#         temp_df = temp_df.append(get_row_dict_2(data, date), ignore_index=True, sort=True)
#         df_district = df_district.append(temp_df, ignore_index=True, sort=True)

#     # fetching yearly data

#     for year in year_dates:
#         print(year)
#         yearly_df = sub_indicator_df[sub_indicator_df['period']
#                                     == 'yearly'].drop_duplicates()
#         temp_df = pd.DataFrame()

#         for index, row in yearly_df.iterrows():
#             print(row['subindicator_id'])
#             subindicator_id = row['subindicator_id']
#             period = row['period']
#             indicator_type = row['indicator_type']
#             if (period == 'yearly' and indicator_type == 'indicator'):
#                 param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#                     .format(subindicator_id, district_ids, year)
#                 url = base_url + param_url
#                 # print (url)

#             data = fetch_data(url, '')

#             nodata_subindicator_list_district.append({'subindicator_id': subindicator_id,
#                                                     'date': year,
#                                                     'number_of_districts': len(data['rows'])})
#             temp_df = temp_df.append(get_row_dict(data, year), ignore_index=True, sort=True)
#         df_district = df_district.append(temp_df, ignore_index=True, sort=True)


#     # fetching indicator 3 data
#     df_district = df_district.append(
#         fetch_indicator_3_data_new(
#             dates, base_url, district_ids), ignore_index=True, sort=True)

#     # import pdb; pdb.set_trace()

#     if os.path.exists('data/subindicator_scores_districts.csv'):
#         ''' Removing same date data if exists '''
#         # import pdb; pdb.set_trace()
#         remove_data = df_district['date'].unique().tolist()
#         filter_data = pd.read_csv('data/subindicator_scores_districts.csv', encoding='utf-8')
#         filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
#                          inplace=True)
#         df_district = filter_data.append(df_district, ignore_index=True, sort=True)

#     # For yearly sub-indicators that are updated once in 5 years, we replicate the date across years
#     # Year array
#     year_array = [x for x in remove_data if len(x)==4]
#     # 5 year indicators for which data needs to be generated
#     # removed 'FRafAE8qFP6', 'ux6uaflq7xZ' on 26-05-2022
#     re = [ 'cB6y5lovUZX.Ti9FJqkSK6J', 'LQRtOv7IQrQ.Ti9FJqkSK6J']

#     # Remove entries for 2019 for re(4) indicators in current df
#     df_district = df_district.loc[~ (df_district['subindicator_id'].isin(re)& df_district['date'].isin(year_array)) ]
#     # Get 2017 data from df
#     df_2017 = df_district.loc[ (df_district['subindicator_id'].isin(re)& df_district['date'].isin([2017])) ]

#     # Append replicated data with changed dates
#     for x in year_array:
#         df_test_2017  = df_2017
#         df_test_2017 = df_test_2017.replace(2017,x )
#         df_district = df_district.append(df_test_2017)

#     df_district.to_csv(
#         'data/subindicator_scores_districts.csv',
#         index=False,
#         encoding='utf-8')

#     indicator_14(dates, 'indicator_14', 'indicator_mappings')
#     indicator_13_14(dates, 'indicator_13', 'indicator_mappings')
#     # indicator_13_14_other(dates, 'indicator_13', 'indicator_mappings')

#     return df_district


# def fetch_block_data(dates, year_dates, sub_indicator_df, base_url, block_ids):
#     """Fetching block level data."""
#     logger.info('*' * 10 + 'fetching blocks data' + '*' * 10)
#     df_blocks = pd.DataFrame()
#     for date in dates:
#         print(date)
#         temp_df = pd.DataFrame()
#         monthly_df = sub_indicator_df[sub_indicator_df['period']
#                                       == 'monthly'].drop_duplicates()
#         for index, row in monthly_df.iterrows():
#             print(row['subindicator_id'])
#             subindicator_id = row['subindicator_id']
#             period = row['period']
#             indicator_type = row['indicator_type']
#             if (period == 'monthly' and indicator_type == 'indicator'):
#                 param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#                     .format(subindicator_id, block_ids, date)
#                 url = base_url + param_url
#             data = fetch_data(url, '')
#             try:
#                 get_df = pd.DataFrame()
#                 get_df = get_df.append(get_row_dict(data, date))
#                 temp_df = temp_df.append(get_df)
#             except KeyError:
#                 continue

#         # import pdb; pdb.set_trace();

#         # import pdb; pdb.set_trace()

#         # temp_df.drop(temp_df.query('subindicator_id == "aRueVYr35yM.Ti9FJqkSK6J"').index, inplace=True)
#         temp_df = temp_df[temp_df['subindicator_id'] != 'aRueVYr35yM.Ti9FJqkSK6J']
#         param_url = "?dimension=dx:aRueVYr35yM.Ti9FJqkSK6J&dimension=aDI5f2TIgXx:mgnmdIRKpzA&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#             .format(block_ids, date)
#         # # breakpoint()
#         url = base_url + param_url
#         data = fetch_data(url, '')
#         get_df = pd.DataFrame()
#         get_df = get_df.append(get_row_dict_2(data, date))
#         temp_df = temp_df.append(get_df)
#         df_blocks = df_blocks.append(temp_df)
#         # print(len(temp_df))
#         df_blocks = df_blocks.append(get_indicator_13_data(date), ignore_index=True, sort=True)
#         # print(df_blocks)
#     for year in year_dates:
#         print(year)
#         yearly_df = sub_indicator_df[sub_indicator_df['period']
#                                     == 'yearly'].drop_duplicates()
#         for index, row in yearly_df.iterrows():
#             print(row['subindicator_id'])
#             temp_df = pd.DataFrame()
#             subindicator_id = row['subindicator_id']
#             period = row['period']
#             indicator_type = row['indicator_type']
#             if (period == 'yearly' and indicator_type == 'indicator'):
#                 param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
#                     .format(subindicator_id, block_ids, year)
#                 url = base_url + param_url
#             data = fetch_data(url, '')
#             try:
#                 get_df = pd.DataFrame()
#                 get_df = get_df.append(get_row_dict(data, year))
#                 temp_df = temp_df.append(get_df)
#                 df_blocks = df_blocks.append(temp_df)
#             except KeyError:
#                 continue

#     if os.path.exists('data/subindicator_scores_blocks.csv'):
#         ''' Removing same date data if exists '''
#         # import pdb; pdb.set_trace()
#         remove_data = df_blocks['date'].unique().tolist()
#         filter_data = pd.read_csv('data/subindicator_scores_blocks.csv', encoding='utf-8')
#         filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
#                          inplace=True)
#         df_blocks = filter_data.append(df_blocks, ignore_index=True, sort=True)
#     df_blocks.to_csv(
#             'data/subindicator_scores_blocks.csv',
#             index=False,
#             encoding='utf-8')

#     block_15_16.run_api_script()
#     block_15_16.run_api_script_15()

#     # block_15_16.run_api_script_other()


# def fetch_indicator_3_data(dates, base_url, district_ids):
#     """Fetching indicator 3 data."""
#     df = pd.DataFrame()

#     district_ids_array = district_ids.split(';')

#     for date in dates:
#         for index, sub_indicator in sub_indicator_url_df.iterrows():
#             # fetching for all districts indicator 3a and 3b
#             if sub_indicator['params'] == 'all':
#                 url = sub_indicator['url'].format(district_ids, date)
#                 data = fetch_data(url, '')
#                 temp_df = pd.DataFrame(data['rows'], columns=[
#                     'subindicator_id', 'district_id', 'date', 'value'])
#                 temp_df['subindicator_id'] = sub_indicator['subindicator_id']
#                 if(temp_df.shape[0] < TOTAL_DISTRICTS):
#                     excluded_districts = list(set(district_ids_array) -
#                                               set(temp_df['district_id'].tolist()))

#                     for d in excluded_districts:
#                         temp_df = temp_df.append({
#                             'subindicator_id': sub_indicator['subindicator_id'],
#                             'district_id': d,
#                             'date': date,
#                             'value': 0
#                         }, ignore_index=True)

#                 df = df.append(temp_df)

#             # fetching data for 3c and 3d
#             else:
#                 temp_df = pd.DataFrame(
#                     columns=[
#                         'subindicator_id',
#                         'district_id',
#                         'date',
#                         'value'])
#                 for district_id in district_ids_array:
#                     url = sub_indicator['url'].format(district_id, date)
#                     data = fetch_data(url, '')
#                     if 'rows' in data.keys():
#                         if (len(data['rows']) > 0):
#                             temp_df = temp_df.append({
#                                 'subindicator_id': sub_indicator['subindicator_id'],
#                                 'district_id': district_id,
#                                 'date': date,
#                                 'value': data['rows'][0][3]
#                             }, ignore_index=True)
#                         else:
#                             temp_df = temp_df.append({
#                                 'subindicator_id': sub_indicator['subindicator_id'],
#                                 'district_id': district_id,
#                                 'date': date,
#                                 'value': 0
#                             }, ignore_index=True)
#                 df = df.append(temp_df)
#     return df

# def fetch_indicator_3_data_new(dates, base_url, district_ids):
#     """Fetching indicator 3 data."""
#     df = pd.DataFrame()

#     district_ids_array = district_ids.split(';')

#     for date in dates:
#         for index, sub_indicator in sub_indicator_url_df.iterrows():
#             # fetching for all districts indicator 3a and 3b
#             if sub_indicator['params'] == 'all':
#                 url = sub_indicator['url'].format(district_ids, date)
#                 data = fetch_data(url, '')
#                 temp_df = pd.DataFrame(data['rows'], columns=[
#                     'subindicator_id', 'xyz', 'district_id', 'date', 'value'])
#                 temp_df['subindicator_id'] = sub_indicator['subindicator_id']
#                 del temp_df['xyz']
#                 if(temp_df.shape[0] < TOTAL_DISTRICTS):
#                     excluded_districts = list(set(district_ids_array) -
#                                               set(temp_df['district_id'].tolist()))

#                     for d in excluded_districts:
#                         temp_df = temp_df.append({
#                             'subindicator_id': sub_indicator['subindicator_id'],
#                             'district_id': d,
#                             'date': date,
#                             'value': 0
#                         }, ignore_index=True)

#                 df = df.append(temp_df)

#             # fetching data for 3c and 3d
#             else:
#                 temp_df = pd.DataFrame(
#                     columns=[
#                         'subindicator_id',
#                         'district_id',
#                         'date',
#                         'value'])
#                 for district_id in district_ids_array:
#                     url = sub_indicator['url'].format(district_id, date)
#                     data = fetch_data(url, '')
#                     if 'rows' in data.keys():
#                         if (len(data['rows']) > 0):
#                             temp_df = temp_df.append({
#                                 'subindicator_id': sub_indicator['subindicator_id'],
#                                 'district_id': district_id,
#                                 'date': date,
#                                 'value': data['rows'][0][4]
#                             }, ignore_index=True)
#                         else:
#                             temp_df = temp_df.append({
#                                 'subindicator_id': sub_indicator['subindicator_id'],
#                                 'district_id': district_id,
#                                 'date': date,
#                                 'value': 0
#                             }, ignore_index=True)
#                 df = df.append(temp_df)
#     return df

# def indicator_13_14_other(dates, indicator_id, mapping_id):
#     df = pd.DataFrame()
#     date = 202003
#     url = 'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}\
#         &var=ed:{}&paging=false'.format(config[mapping_id][indicator_id], 20200221, 20200401)
#     data = fetch_data(url, 'indicator_13_14')
#     df_list = list()
#     for d in data['listGrid']['rows']:
#         df_list.append({
#             'date': date,
#             'district': d[0].strip() if indicator_id == 'indicator_14' else d[1].strip(),
#             'district_id': d[1] if indicator_id == 'indicator_14' else d[0],
#             'indicator_id': indicator_id,
#             'perc_point': d[4]
#         })
#     df = df.append(pd.DataFrame(df_list), ignore_index=True)

#     if os.path.exists('data/'+indicator_id+'_data.csv'):
#         ''' Removing same date data if exists '''
#         remove_data = df['date'].unique().tolist()
#         filter_data = pd.read_csv('data/'+indicator_id+'_data.csv', encoding='utf-8')
#         filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
#                          inplace=True)
#         df = filter_data.append(df, ignore_index=True, sort=True)
#     df.to_csv(
#         'data/'+indicator_id+'_data.csv',
#         index=False,
#         encoding='utf-8')



# def indicator_13_14(dates, indicator_id, mapping_id):
#     df = pd.DataFrame()
#     for date in dates:
#         # url = ""
#         print("*****check*****",config[mapping_id][indicator_id])
#         url = 'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}01\
#         &var=ed:{}01&paging=false'.format(config[mapping_id][indicator_id], '202210', '202211')
#         # # breakpoint()
#         data = fetch_data(url, 'indicator_13_14')
#         df_list = list()
#         for d in data['listGrid']['rows']:
#             df_list.append({
#                 'date': 202210,
#                 'district': d[0].strip() if indicator_id == 'indicator_14' else d[1].strip(),
#                 'district_id': d[1] if indicator_id == 'indicator_14' else d[0],
#                 'indicator_id': indicator_id,
#                 'perc_point': d[4]
#             })
#         df = df.append(pd.DataFrame(df_list), ignore_index=True)
#     if os.path.exists('data/'+indicator_id+'_data.csv'):
#         ''' Removing same date data if exists '''
#         remove_data = df['date'].unique().tolist()
#         filter_data = pd.read_csv('data/'+indicator_id+'_data.csv', encoding='utf-8')
#         filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
#                          inplace=True)
#         df = filter_data.append(df, ignore_index=True, sort=True)
#     df.loc[df['perc_point'] > 100, 'perc_point'] = 100
#     df.to_csv(
#         'data/'+indicator_id+'_data.csv',
#         index=False,
#         encoding='utf-8')

# def indicator_14(dates, indicator_id, mapping_id):
#     df = pd.DataFrame()
#     for date in dates:
#         # url = ""
#         url = 'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}01\
#         &var=ed:{}31&paging=false'.format(config[mapping_id][indicator_id], '202210', '202210')
#         data = fetch_data(url, 'indicator_13_14')
#         # # breakpoint()
#         df_list = list()
#         for d in data['listGrid']['rows']:
#             df_list.append({
#                 'date': date,
#                 'district': d[0].strip() if indicator_id == 'indicator_14' else d[1].strip(),
#                 'district_id': d[1] if indicator_id == 'indicator_14' else d[0],
#                 'indicator_id': indicator_id,
#                 'perc_point': d[4]
#             })
#         df = df.append(pd.DataFrame(df_list), ignore_index=True)
#     # # breakpoint()
#     if os.path.exists('data/'+indicator_id+'_data.csv'):
#         ''' Removing same date data if exists '''
#         remove_data = df['date'].unique().tolist()
#         filter_data = pd.read_csv('data/'+indicator_id+'_data.csv', encoding='utf-8')
#         filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
#                          inplace=True)
#         df = filter_data.append(df, ignore_index=True, sort=True)
#     df.loc[df['perc_point'] > 100, 'perc_point'] = 100
#     df.to_csv(
#         'data/'+indicator_id+'_data.csv',
#         index=False,
#         encoding='utf-8')


def get_nfhs_data(year_date, month_dates):
    subindicator_list = ['VJ2ccLnKQPv', 'Z0rXYfMQZST', 'yBfIJ7wBbcF', 'FRafAE8qFP6', 'ux6uaflq7xZ',
        'NKzxO47lsF3', 'fyuGMPRH02k', 'jHHZKr89vwY', 't03VPkJ5UXd.Ti9FJqkSK6J']
    district_score = gramex.cache.open('data/subindicator_scores_districts.csv',
                                       'csv', rel=True,
                                       encoding='utf-8')[['date', 'district_id',
                                                          'subindicator_id', 'value']]
    year_date.extend(month_dates)
    total_dates = year_date
    district_score = district_score[district_score['date'].isin(total_dates)]
    df = pd.DataFrame()
    # # breakpoint()
    for sub_indicator in subindicator_list:
        filter_score = district_score.loc[district_score['subindicator_id'] == sub_indicator]
        filter_block = pd.merge(organisation_unit, filter_score, on='district_id')
        df = df.append(filter_block, ignore_index=True)
    df = df[['date', 'block', 'block_id', 'subindicator_id', 'value']].drop_duplicates()
    df.rename(columns={'block': 'district', 'block_id': 'district_id'}, inplace=True)
    # # breakpoint()
    return df


# def block_indicator_7_11_data(dates, block_map_ids):
#     dis = pd.read_csv('data/district_scores_quarter.csv', encoding='utf-8')
#     # date_formatted = pd.to_datetime(dates, format='%Y%m').strftime('%Y-%m-%d').tolist()
#     # dis = dis[dis['date'].isin(date_formatted)]
#     mak = dis[dis['indicator_id'].isin(['indicator_12', 'indicator_7'])]
#     mak = mak.replace('indicator_12', 'indicator_11')
#     organisation_unit = pd.read_csv(os.path.join(PATH, 'data', 'ou_id_mappings.csv'), encoding='utf-8')
#     organisation_unit = organisation_unit[['uid_district', 'district', 'uid_block', 'block']]
#     total_districts = organisation_unit[['uid_district', 'district',
#                                          'uid_block', 'block']].drop_duplicates().reset_index()
#     total_districts.rename(index=str, columns={'uid_district': 'district_id',
#                                                'uid_block': 'block_id'}, inplace=True)
#     del total_districts['index']
#     mak = mak.merge(total_districts, how='left', on='district_id')
#     del mak['district_y']
#     mak = mak.replace('district_x', 'district')
#     del mak['map_id']
#     mak = pd.merge(mak, block_map_ids[['block_id', 'map_id']], on='block_id')
#     mak['district'] = mak['district_x']
#     del mak['district_x']
#     organisation_unit = pd.read_csv(os.path.join(PATH, 'data', 'ou_id_mappings.csv'), encoding='utf-8')
#     organisation_unit = organisation_unit[['uid_block',
#                                            'facility']].groupby(['uid_block']).size().reset_index()
#     organisation_unit['block_id'] = organisation_unit['uid_block']
#     del organisation_unit['uid_block']
#     organisation_unit['count'] = organisation_unit[0]
#     del organisation_unit[0]
#     mak = pd.merge(mak, organisation_unit, on='block_id')
#     mak.to_csv('data/indicator_7_11.csv', index=False, encoding='utf-8')
#     return mak


def calculate_total_block_data(df_district_scores):
    indicator_df = df_district_scores
    indicator_df.rename(columns={0: 'count'}, inplace=True)
    # indicator_7_11_df = df_indicator_7_11
    # indicator_7_11_df.rename(columns={'district_id': 'uid_district'}, inplace=True)
    # total_block_data = pd.concat([indicator_df, indicator_7_11_df], sort=True)
    # total_block_data['date'] = total_block_data['date'].apply(lambda x:
    #                                                           pd.to_datetime(x,
    #                                                                          format='%Y-%m-%d'))
    indicator_mapping = {
        "indicator_1": "indicator_1",
        "indicator_2": "indicator_22",
        "indicator_3": "indicator_2",
        "indicator_4": "indicator_4",
        "indicator_5": "indicator_5",
        "indicator_6": "indicator_6",
        "indicator_7": "indicator_7",
        "indicator_8": "indicator_8",
        "indicator_9": "indicator_9",
        "indicator_10": "indicator_11",
        "indicator_11": "indicator_12",
        "indicator_12": "indicator_121",
        "indicator_13": "indicator_131",
        "indicator_14": "indicator_141",
        "indicator_15": "indicator_14",
        "indicator_16": "indicator_13"}

    def func(x):
        return indicator_mapping[x]

    indicator_df['indicator_id_'] = indicator_df['indicator_id'].apply(func)
    del indicator_df['indicator_id']
    indicator_df.rename(columns={'indicator_id_': 'indicator_id',
                                     'uid_district': 'district_id'},
                            inplace=True)
    return indicator_df



def get_indicator_13_data(date):
    sub_indicator = 'Pw5SdRehu6Y'
    data = fetch_data('https://uphmis.in/uphmis/api/sqlViews/Pw5SdRehu6Y/data?var=sd:{}01&var=ed:{}01&paging=false'.format(date, date),'indicator_13_14')
    df_list = list()
    for d in data['listGrid']['rows']:
        df_list.append({
            'date': date,
            'district': d[1].strip(),
            'district_id': d[0],
            'subindicator_id': 'Pw5SdRehu6Y',
            'value': d[2]
        })
    district_score = pd.DataFrame(df_list)
    district_score = district_score
    df = pd.DataFrame()
    # import pdb; pdb.set_trace()
    filter_score = district_score.loc[district_score['subindicator_id'] == sub_indicator]
    filter_block = filter_score
    # filter_block = pd.merge(organisation_unit, filter_score, on='district_id')
    df = df.append(filter_block, ignore_index=True)
    # df = df[['date', 'block', 'block_id', 'subindicator_id', 'value']].drop_duplicates()
    # df.rename(columns={'block': 'district', 'block_id': 'district_id'}, inplace=True)
    return df

def write_df(new_df, file_name):
    """Write the csv file after deleting existing dates"""
    # remove timestamp from date column and convert to string

    # If date column not a object string, convert to string
    if (new_df['date'].dtype != 'O'):
        new_df['date'] = new_df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    fpath = os.path.join(PATH, "data" ,file_name)
    if os.path.exists(fpath):
        ''' Removing same date data if exists '''
        uniq_dates = new_df['date'].unique().tolist()
        old_df = pd.read_csv(fpath, encoding='utf-8')
        old_df.drop(old_df.loc[old_df['date'].isin(uniq_dates)].index,
                         inplace=True)
        new_df = old_df.append(new_df, ignore_index=True, sort=True)
    new_df.to_csv(
        fpath,
        index=False,
        encoding='utf-8')

# Fetches block data for previous time period for Asha indicator
def get_asha_prev_block(prev_date):
    subindicator_list = ['fyuGMPRH02k']
    district_score = gramex.cache.open('data/subindicator_scores_districts.csv',
                                       'csv', rel=True,
                                       encoding='utf-8')[['date', 'district_id',
                                                          'subindicator_id', 'value']]

    total_dates = [prev_date]
    district_score = district_score[district_score['date'].isin(total_dates)]
    df = pd.DataFrame()
    for sub_indicator in subindicator_list:
        filter_score = district_score.loc[district_score['subindicator_id'] == sub_indicator]
        filter_block = pd.merge(organisation_unit, filter_score, on='district_id')
        df = df.append(filter_block, ignore_index=True)
    df = df[['date', 'block', 'block_id', 'subindicator_id', 'value']].drop_duplicates()
    df.rename(columns={'block': 'district', 'block_id': 'district_id'}, inplace=True)
    return df


def get_prev_month_tb(date):
    t_date = (pd.to_datetime(date, format="%Y%m") - pd.DateOffset(months=2)).to_period("M")
    return "".join(str(t_date).split('-'))

def get_prev_month_tb_qa(date):
    t_date = (pd.to_datetime(date, format="%Y%m") - pd.DateOffset(months=1)).to_period("M")
    return "".join(str(t_date).split('-'))


def get_cur_quarter_tb(date):
    _d = pd.to_datetime(date, format='%Y%m')
    Q = pd.Timestamp(_d).quarter

    return Q

def get_cur_quarter(date):
    _d = pd.to_datetime(date, format='%Y%m')
    Q = pd.Period(_d, freq='Q-MAR').strftime('Q%q')

    return Q


def get_previous_quarter_end_date_tb(date):
    if date.month < 4:
        return datetime(date.year - 1, 12, 31)
    elif date.month < 7:
        return datetime(date.year, 3, 31)
    elif date.month < 10:
        return datetime(date.year, 6, 30)
    return datetime(date.year, 9, 30)
