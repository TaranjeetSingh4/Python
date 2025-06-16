"""Program area indicator calculation"""
import gramex.cache
import pandas as pd
import os.path
import json
import requests
import urllib3
import numpy as np
from collections import defaultdict
import traceback
import sqlalchemy
from sqlalchemy import MetaData, inspect
from datetime import datetime
from gramex import variables
staging_db_connection = variables['staging_db_connection']
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

config = gramex.cache.open('config.yaml', 'yaml', rel=True)
indicator_name = ['1', '2', '5', '6', '9', '10', '11', '14',
                  '16', '17', '18', '19', '20', '21', '22', '28', '30', '32', '35',
                  '48', '49', '50', '51', '52']
# start_date = config['start_date']
# end_date = config['end_date']
# fetch_date = config['fetching_start_date']
# get_year_date = [date[0] for date in config['year']]
# date_range = pd.date_range(
#     start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# dates = [[date] for date in date_range.strftime('%Y%m')]
# fetch_date_range = pd.date_range(
#     start=fetch_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]
# year_dates = [date[0:4] for date in get_year_date]
pa_config = gramex.cache.open('pa-config.yaml', 'yaml', rel=True)
BASE_URL = config['api']['base_url']

"""
Contain All division/district/block details
"""
organisation_unit = gramex.cache.open(
    'data/ou_id_mappings.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)[['state', 'uid_state', 'uid_district', 'district', 'uid_division', 'division']]



district_ids = ';'.join(organisation_unit['uid_district'].unique())
division_ids = ';'.join(organisation_unit['uid_division'].unique())
state_ids = ';'.join(organisation_unit['uid_state'].unique())
# print(district_ids)
"""
District map ids are present in district_map_id.csv
"""
district_map_ids = gramex.cache.open(
    'data/district_map_id.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)

division_map_ids = gramex.cache.open(
    'data/division_map_id.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)
"""
Contain All district sub indicator ids of Program area
"""

district_sub_ind = gramex.cache.open(
    'data/pa/pa_sub_indicator_data.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)

# separating yearly and monthly sub indicators
dist_ind_ids_yearly = ';'.join(district_sub_ind[district_sub_ind['period']=='yearly' ]['subindicator_id'].unique())
dist_ind_ids_monthly = ';'.join(district_sub_ind[district_sub_ind['period']=='monthly' ]['subindicator_id'].unique())

def get_fy(x):
    # return '2017'
    x = pd.to_datetime(x, format='%Y%m')
    if (x.month > 3):
        return x.year
    else:
        return x.year - 1

def fetch_data(url, indicator_mapping):
    """Make a http request and return data dictionary."""
    try:
        resp = requests.get(url, verify=False,
                            headers={'content-type': 'application/json'})
        return json.loads(resp.text)
    except Exception:
        _data = pd.DataFrame([url], columns=['urls'])
        if os.path.exists("data/pa/error_url.csv"):
            _data.to_csv("data/pa/error_url.csv", header=False, mode="a", index=False,
                         encoding='utf-8')
        else:
            _data.to_csv("data/pa/error_url.csv", index=False, encoding='utf-8')
        return {}


def fetch_district_data(dates, year_dates, base_url, district_ids, data_type):
    """Fetching district level data."""
    df_district = pd.DataFrame()

    # monthly data
    for date in dates:
        print(date)
        temp_df = pd.DataFrame()
        param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
            .format(dist_ind_ids_monthly, district_ids, date)
        url = base_url + param_url
        data = fetch_data(url, '')
        temp_df = temp_df.append(get_row_dict(data, date, data_type), ignore_index=True, sort=True)
        df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    # yearly data
    for date in year_dates:
        print ('year '+ date)
        temp_df = pd.DataFrame()
        param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
            .format(dist_ind_ids_yearly, district_ids, date)
        url = base_url + param_url
        data = fetch_data(url, '')
        temp_df = temp_df.append(get_row_dict(data, date, data_type), ignore_index=True, sort=True)
        df_district = df_district.append(temp_df, ignore_index=True, sort=True)


    if os.path.exists('data/pa/pa_subindicator_scores_'+data_type+'.csv'):
        ''' Removing same date data if exists '''
        # import pdb; pdb.set_trace()
        remove_data = df_district['date'].unique().tolist()
        # remove_ind = df_district['date'].unique().tolist()
        filter_data = pd.read_csv('data/pa/pa_subindicator_scores_'+data_type+'.csv', encoding='utf-8')
        filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
                         inplace=True)
        df_district = filter_data.append(df_district, ignore_index=True, sort=True)

    df_district.to_csv(
        'data/pa/pa_subindicator_scores_'+data_type+'.csv',
        index=False,
        encoding='utf-8')
    return df_district


def get_row_dict(data, date, data_type, i_type='all'):
    """Filter the data and returns row dictionary."""
    dict_list = list()
    # df = pd.DataFrame()
    try:
        if (len(data['rows']) != 0):
            if (len(data['rows'][0]) == 3):
                for d in data['rows']:
                    try:
                        dic_ = data['metaData']['names']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            data_type+'_id': d[1],
                            data_type : dic_[d[1]].strip(),
                            'value': d[2]
                        })
                    except KeyError:
                        dic_ = data['metaData']['items']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            data_type+'_id': d[1],
                            data_type : dic_[d[1]]['name'].strip(),
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
                            data_type+'_id': d[1],
                            data_type : dic_[d[1]].strip(),
                            'value': d[3]
                        })
                    except KeyError:
                        dic_ = data['metaData']['items']
                        dict_list.append({
                            'date': date,
                            'subindicator_id': d[0],
                            data_type+'_id': d[1],
                            data_type : dic_[d[1]]['name'].strip(),
                            'value': d[3]
                        })
                df = pd.DataFrame(dict_list)
                if (i_type != 'one'):
                    df = pd.merge(df,
                                  organisation_unit[
                                      [data_type, data_type+'_id']] .drop_duplicates(),
                                      on=data_type+'_id', how='outer')
                    df.rename(columns={data_type+'_y': data_type}, inplace=True)
                    df['date'] = date
                    del df[data_type+'_x']
                return df.fillna(0)
    except KeyError:
        return dict_list


def indicator_calculation(indicator, date, data, mapping, data_type):
    indicators = pa_config[mapping]['ind_'+indicator]
    # import pdb; pdb.set_trace()
    indicators_rev = {v: k for k, v in indicators.items()}
    required_subindicators = [k for k in indicators_rev.keys()]
    subindicator_data = district_sub_ind[
        district_sub_ind['subindicator_id'].isin(required_subindicators)]

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
                data_a = data_a[[data_type+'_id', name_a1]]
                if len(data_all) != 0:
                    data_all = pd.merge(
                        data_all, data_a, on=data_type+"_id", how='left')
                else:
                    data_all = data_all.append(data_a)
            else:
                data_all[name_a1] = 0
        if(_data != '0000'):
          _def_date = _data

    _def_date = date[0]
    for k,v in key_dict.items():
        data_all[k] = data_all[v].sum(axis=1)
        _lista.append(k)

    for key in get_year_indicator:
        name_b1 = "{}".format(indicators_rev[key])
        _lista.append(name_b1)
        data_b = data_yearly[data_yearly['subindicator_id'].isin(
            [key]) & data_yearly['date'].isin([current_fy])]
        data_b.drop_duplicates(inplace=True)
        if len(data_b) != 0:
            data_b[name_b1] = data_b['value']
            data_b = data_b[[data_type+'_id', name_b1]]
            if len(data_all) != 0:
                data_all = pd.merge(
                    data_all, data_b, on=data_type+'_id', how='left')
            else:
                data_all = data_all.append(data_b)
        else:
            data_all[name_b1] = 0

    # calculation method
    data_all['value'] = eval(
        pa_config[mapping][indicator+'_method']).replace(np.inf, 0)
    data_all['date'] = _def_date

    data_all['indicator_id'] = indicator
    data_all.drop(_lista, axis=1, inplace=True)
    return data_all


def calculate_scores(dates, data_type, date_type):
    """Calculate final scores."""
    data = gramex.cache.open(
        'data/pa/pa_subindicator_scores_'+data_type+'.csv',
        'csv',
        rel=True,
        encoding='utf-8'
    )
    df_district_scores = pd.DataFrame()
    for date in dates:
        # print(date, data_type)
        for indicator in indicator_name:
            print(date, indicator)
            df_district_scores = df_district_scores.append(
                indicator_calculation(indicator, date, data, 'indicator_mappings', data_type))

    total_districts = organisation_unit[
        ['uid_'+data_type, data_type]].drop_duplicates().reset_index()
    total_districts.rename(
        index=str, columns={'uid_'+data_type: data_type+'_id'}, inplace=True)
    del total_districts['index']
    df_district_scores.reset_index(inplace=True)
    del df_district_scores['index']
    # import pdb; pdb.set_trace()
    df_district_scores = pd.merge(
        df_district_scores, total_districts, on=data_type+'_id')
    map_val = 'map_id' if data_type == 'district' else 'div_map_id'
    map_id_df = district_map_ids if data_type == 'district' else division_map_ids
    if(data_type != 'state'):
        key_id = data_type+'_id' if data_type == 'district' else data_type
        df_district_scores = pd.merge(
            df_district_scores, map_id_df[[key_id, map_val]].drop_duplicates(),
            on=key_id)
    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    # Indicators of type 'number' and not percentage
    l = ['3', '4', '36', '38', '37', '48', '49', '50', '51', '52']

    # Separate number and percentage indicators
    df_num = df_district_scores[df_district_scores['indicator_id'].isin(l)]
    df_per = df_district_scores[~df_district_scores['indicator_id'].isin(l)]

    # Compute percentage and round off if percent indicators
    df_per['value'] = df_per['value'].apply(lambda x: x*100)
    df_per['value'] = df_per['value'].apply(lambda x: 100 if (x>100) else x)
    df_district_scores = pd.concat([df_per, df_num])

    df_district_scores['rank'] = df_district_scores.groupby(['indicator_id', 'date'])['value'].rank(ascending=0, method='dense')

    # df_district_scores.to_csv("data/pa/"+data_type+"-"+date_type+"scores_sep.csv", index=False, encoding='utf-8')
    # To csv
    write_df(df_district_scores, "data/pa/"+data_type+"-"+date_type+"scores.csv",data_type+"-"+date_type+"scores")

def write_df(new_df, file_name,data_type):
    """Write the csv file after deleting existing dates"""
    # remove timestamp from date column and convert to string
    new_df['date'] = new_df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
    dates = new_df['date'].unique()

    # if os.path.exists(file_name):
    #     ''' Removing same date data if exists '''
    #     uniq_dates = new_df['date'].unique().tolist()
    #     old_df = pd.read_csv(file_name, encoding='utf-8')

    #     # Extract HR data (currently present only in yearly files)
    #     hr = ['36', '37', '38']
    #     hr_old = old_df[old_df['indicator_id'].isin(hr)]

    #     old_df.drop(old_df.loc[old_df['date'].isin(uniq_dates)].index,
    #                      inplace=True)
    #     new_df = old_df.append(new_df, ignore_index=True, sort=True)
    #     new_df = new_df.append(hr_old, ignore_index=True, sort=True)
    # breakpoint()


    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    inspector.get_table_names()
    with engine.connect() as con:
        con.execute(""" DELETE from `{}` where date='{}' """.format(data_type,dates[0]))

    new_df.to_sql(data_type, con=engine, if_exists='append', index=False)

    # new_df.to_csv(
    #     file_name,
    #     index=False,
    #     encoding='utf-8')

# Subindicator scores
def fetch_phase2_data(fetching_dates,year_dates):
    fetch_district_data(fetching_dates,year_dates, BASE_URL, district_ids, 'district')
    fetch_district_data(fetching_dates,year_dates, BASE_URL, division_ids, 'division')
    fetch_district_data(fetching_dates,year_dates, BASE_URL, state_ids, 'state')

# # Indicator scores

def caculate_phase2_data(dates):

    #### get quarter dates #########
    current_date = datetime.strptime(str(dates[0]), "%Y%m")
    currQuarter = int((current_date.month - 1) / 3 + 1)
    dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)

    # print(dtFirstDay)

    q_frst = dtFirstDay.strftime("%Y%m")
    # print(q_frst)
    dates_qa =[]
    li = []
    d = int(dates[0])
    qua = int(q_frst)
    while qua<=d:
        li.append(str(qua))
        qua+=1

    dates_qa.append(li)
    print(li)


    ######## get year dates ###############3
    d= dates[0]
    print(int(d)%100)
    if (int(d)%100) == 1 or (int(d)%100) == 2 or (int(d)%100) == 3:
        g_year = (int(d)//100)-1
        print(g_year)

        year = str(g_year) +'04'

        print(year)
    else:
        g_year = int(d)//100
        print(g_year)

        year = str(g_year) +'04'

        print(year)

    y_start = int(year)
    p_date = int(d)

    dates_yr =[]
    y_list = []

    while (y_start <= p_date):
        if y_start%100 <=12 and y_start%100 != 0:
            y_list.append(y_start)
        y_start +=1


    dates_yr.append(y_list)
    print(dates)
    calculate_scores([dates], 'district', '')
    calculate_scores(dates_qa, 'district', 'quarter-')
    calculate_scores(dates_yr, 'district', 'year-')

    calculate_scores([dates], 'division', '')
    calculate_scores(dates_qa, 'division', 'quarter-')
    calculate_scores(dates_yr, 'division', 'year-')

    calculate_scores([dates], 'state', '')
    calculate_scores(dates_qa, 'state', 'quarter-')
    calculate_scores(dates_yr, 'state', 'year-')



def trigger_fetch_process(args):
    status = "failed"
    error = None
    global start_date, end_date, get_year_date, year_dates, date_range, dates, fetch_date_range, fetching_dates, indicator_input, indicator_input_block
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
            start=end_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]


    indicator_input = args.get('district_indicator_ids[]') if args.get('district_indicator_ids[]') else []
    indicator_input_block = args.get('block_indicator_ids[]') if args.get('block_indicator_ids[]') else []
    try:
        fetch_phase2_data(fetching_dates,year_dates)
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        print("Error in pa_calculation.trigger_fetch_process: ", e)
    return {"status":status, "error" : error}
