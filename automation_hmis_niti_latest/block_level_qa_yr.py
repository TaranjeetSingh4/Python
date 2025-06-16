import json
import gramex.cache
import pandas as pd
import requests
import os.path
import numpy as np
import calculations as calc
from collections import defaultdict
PATH = os.path.dirname(__file__)
organisation_unit = gramex.cache.open(
    os.path.join(PATH, 'data','ou_id_mappings.csv'),
    'csv',
    rel=True,
    encoding='utf-8'
)[['uid_district', 'district', 'uid_block', 'block']].rename(
    columns={'uid_district': 'district_id', 'uid_block': 'block_id'})


subindicator_blocks = gramex.cache.open(
    'data/sub_indicator_data_block.csv',
    'csv',
    rel=True,
    encoding='utf-8')

config = gramex.cache.open('config.yaml', 'yaml', rel=True)

def get_fy(x):
    # print(x)
    # # breakpoint()
    # return '2017'
    x = pd.to_datetime(x, format='%Y%m')
    if (x.month > 3):
        return x.year
    else:
        return x.year - 1


def indicator_qa_block(date, data, mapping, indicator_id):
    # print(indicator_id, 'indicator id')
    if(indicator_id == 'indicator_11'):
        print(date, 'date')
        curr_date = int(date[-1]) # convert string to date
        print(curr_date, 'curr_date')
        current_qa = calc.get_cur_quarter(curr_date)
        print(current_qa, 'current_qa')
        if(current_qa != 'Q1'):
            # prev_date = curr_date - 1 # subtract 1 month
            # prev_prev_date = curr_date - 2 # subtract 2 month

            if curr_date%100 == 1:
                prev_date = curr_date - 89
                prev_prev_date = prev_date -1
            elif curr_date% 100 == 2:
                prev_date = curr_date - 1
                prev_prev_date = prev_date -89
            else:
                prev_date = curr_date -1
                prev_prev_date = prev_date - 1
            if(len(date) == 1):
                data_prev_a = calc.get_asha_prev_block(prev_date)
                data_prev_prev_a = calc.get_asha_prev_block(prev_prev_date)
                data = pd.concat([data, data_prev_a, data_prev_prev_a])
            if(len(date) == 2):
                data_prev_prev_a = calc.get_asha_prev_block(prev_prev_date)
                data = pd.concat([data, data_prev_prev_a])
            date = [prev_prev_date, prev_date, curr_date]
            print(date, 'final date')
    indicators = config[mapping][indicator_id]
    indicators_rev = {v: k for k, v in indicators.items()}
    required_subindicators = [k for k in indicators_rev.keys()]
    subindicator_data = subindicator_blocks[
        subindicator_blocks['subindicator_id'].isin(required_subindicators)]
    current_fy = get_fy(date[0])
    data_monthly = data[data['subindicator_id'].isin(required_subindicators) &
        data['date'].isin(date)]
    data_yearly = data[data['subindicator_id'].isin(required_subindicators) &
    data['date'].isin([current_fy])]
    get_year_indicator = subindicator_data[subindicator_data['period']=='yearly']['subindicator_id'].unique().tolist()
    required_indicator_month = [indicators_rev[k] for k in indicators_rev.keys() if(k not in get_year_indicator)]
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)
    _def_date = ""
    _lista = []
    data_all = pd.DataFrame()
    _data = date[0]
    for idx in range(0, 3):
        if(len(date) > idx):
            _data = date[idx]
        else:
            _data = '0000'
        _lista.extend("{}{}".format(ind, idx) for ind in required_indicator_month)
        for key in required_indicator_month:
            name_a1 = "{}{}".format(key, idx)
            data_a = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]
                if len(data_all) != 0:
                    data_all = pd.merge(
                        data_all, data_a, on="district_id", how='outer')
                else:
                    data_all = data_all.append(data_a)
            else:
                data_all[name_a1] = 0
        if(_data != '0000'):
          _def_date = _data
    # print(data_all)
    data_all.fillna(0, inplace = True)
    # print(required_indicator_month,"---------", get_year_indicator)
    for key in get_year_indicator:
        name_b1 = "{}".format(indicators_rev[key])
        _lista.append(name_b1)
        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)
        if len(data_b) != 0:
            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_b, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_b)
        else:
            data_all[name_b1] = 0

    # print(data_all)
    # calculation method
    indicator_mapping = config[mapping][indicator_id+'_method_qa']
    print(indicator_mapping)
    # # breakpoint()
    if(indicator_mapping.count('{}') == 1):
        indicator_mapping = indicator_mapping.format(len(date))
    elif(indicator_mapping.count('{}') == 2):
        indicator_mapping = indicator_mapping.format(len(date), len(date))
    # print(indicator_id)
    if(indicator_id == 'indicator_11'):
        test_resutl = data_all.loc[data_all['district_id'] == 'FGqvmr1orP5']
        print(test_resutl)
        # breakpoint()
        if(len(date) == 1):
            print('inside month 1')
            data_all['perc_point'] =  eval(
                "(data_all['a0'] * 100000 / 2) / data_all['b0']"
            )
        elif(len(date) == 2):
            print('inside month 2')
            data_all['perc_point'] =  eval(
                "(((data_all['a0'] - 0) + (data_all['a1'] - data_all['a0'])) * 100000 / 2) / data_all['b1']"
            )
        elif(len(date) == 3):
            print('inside month 3')
            data_all['perc_point'] =  eval(
                "(((data_all['a1'] - data_all['a0']) + (data_all['a2'] - data_all['a1'])) * 100000 / 2) / data_all['b1']"
            )
    elif (indicator_id == 'indicator_13' or indicator_id == 'indicator_14'):
        data_all['perc_point'] =  eval(indicator_mapping)
        data_all = data_all.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    else:
        data_all['perc_point'] =  eval(indicator_mapping).replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = indicator_id
    sub = _lista
    data_all.drop(sub, axis=1, inplace=True)
    # print(data_all)
    return data_all


def indicator_yr_block(date, data, mapping, indicator_id):
    indicators = config[mapping][indicator_id]
    indicators_rev = {v: k for k, v in indicators.items()}
    required_subindicators = [k for k in indicators_rev.keys()]
    subindicator_data = subindicator_blocks[
        subindicator_blocks['subindicator_id'].isin(required_subindicators)]
    current_fy = get_fy(date[0])
    data_monthly = data[data['subindicator_id'].isin(required_subindicators) &
        data['date'].isin(date)]
    data_yearly = data[data['subindicator_id'].isin(required_subindicators) &
    data['date'].isin([current_fy])]
    get_year_indicator =subindicator_data[subindicator_data['period']=='yearly']['subindicator_id'].unique().tolist()
    required_indicator_month = [indicators_rev[k] for k in indicators_rev.keys() if(k not in get_year_indicator)]
    data_monthly.drop_duplicates(inplace=True)
    data_yearly.drop_duplicates(inplace=True)
    _def_date = ""
    _lista = []
    data_all = pd.DataFrame()
    key_dict = defaultdict(list)
    for idx, _data in enumerate(date):
        _lista.extend("{}{}".format(ind, idx) for ind in required_indicator_month)
        for key in required_indicator_month:
            name_a1 = "{}{}".format(key, idx)
            key_dict[key].append(name_a1)
            data_a = data_monthly[data_monthly['subindicator_id'].isin(
                [indicators[key]]) & data_monthly['date'].isin([_data])]
            data_a.drop_duplicates(inplace=True)
            if len(data_a) != 0:
                data_a[name_a1] = data_a['value']
                data_a = data_a[['district_id', name_a1]]
                if len(data_all) != 0:
                    data_all = pd.merge(
                        data_all, data_a, on="district_id", how='outer')
                else:
                    data_all = data_all.append(data_a)
            else:
                data_all[name_a1] = 0
        if(_data != '0000'):
          _def_date = _data
    # print(key_dict)
    for k,v in key_dict.items():
        # if(indicator_id == 'indicator_4'):
        #     import pdb; pdb.set_trace()
        data_all[k] = data_all[v].sum(axis=1)
        _lista.append(k)
    # print(data_all)
    for key in get_year_indicator:
        name_b1 = "{}".format(indicators_rev[key])
        _lista.append(name_b1)
        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)
        if len(data_b) != 0:
            data_b[name_b1] = data_b['value']
            data_b = data_b[['district_id', name_b1]]
            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_b, on="district_id", how='outer')
            else:
                data_all = data_all.append(data_b)
        else:
            data_all[name_b1] = 0

    # print(data_all)
    # calculation method
    indicator_mapping = config[mapping][indicator_id+'_method_yr']
    # import pdb; pdb.set_trace()
    print(indicator_mapping)
    if(indicator_mapping.count('{}') == 1):
        indicator_mapping = indicator_mapping.format(len(date))
    elif(indicator_mapping.count('{}') == 2):
        indicator_mapping = indicator_mapping.format(len(date), len(date))
    # if(_def_date == '201903' and indicator_id == 'indicator_3'):
    #     import pdb; pdb.set_trace()
    if(indicator_id == 'indicator_11'):
        new_lista = _lista[-4]
        new_listb = _lista[-3]
        data_all['perc_point'] = (
        (data_all[new_lista]* 100000 / len(date)) / data_all[new_listb]).fillna(0)
    elif (indicator_id == 'indicator_13' or indicator_id == 'indicator_14'):
        data_all['perc_point'] =  eval(indicator_mapping)
        data_all = data_all.replace([np.inf, -np.inf], np.nan).dropna(subset=['perc_point'], how="all")
    else:
        data_all = data_all.fillna(0)
        data_all['perc_point'] =  eval(indicator_mapping).replace(np.inf, 0)
    data_all['date'] = _def_date
    data_all['indicator_id'] = indicator_id
    sub = _lista
    data_all.drop(sub, axis=1, inplace=True)
    # print(data_all)
    return data_all

def get_cur_quarter(date):
    _d = pd.to_datetime(date, format='%Y%m')
    Q = pd.Period(_d, freq='Q-MAR').strftime('Q%q')

    return Q


# data = pd.read_csv(
#     'data/subindicator_scores_blocks.csv',
#     encoding='utf-8')
# indicator_yr_block(['201710', '201711', '201712', '201801', '201802', '201803'], data, 'indicator_mappings_block', 'indicator_1')
