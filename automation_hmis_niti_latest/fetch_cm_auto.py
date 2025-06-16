import logging
# import calculations_cm as calc
# import block_level_qa_yr as calc1
import gramex.cache
import pandas as pd
import urllib3
import sys
import os.path
import requests
import json
import traceback
PATH = os.path.dirname(__file__)
# for fetching
organisation_unit = gramex.cache.open(
    os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'block_uid', 'block', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'uid_district', 'block_uid': 'uid_block'}, inplace=True)


start_date = '2022-10-01'
fetch_date = '2022-10-01'
end_date  = '2022-11-01'
g_year= [['202204','202205','202206','202207','202208','202209','202210','202211']]
get_year_date = [date[0] for date in g_year]
year_dates = [date[0:4] for date in get_year_date]

date_range = pd.date_range(
    start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
dates = [date for date in date_range.strftime('%Y%m')]  # ['201909']



fetch_date_range = pd.date_range(
    start=fetch_date, end=end_date, freq=pd.offsets.MonthBegin(1))
fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]


BASE_URL = 'https://uphmis.in/portalAPI/analytics.json'
district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())

sub_indicator_df = gramex.cache.open(
    'data_cm/sub_indicator_data_cm_fetch.csv', 'csv', rel=True, nrows=60, encoding='utf-8')
sub_indicator_df_block = gramex.cache.open(
    'data_cm/sub_indicator_data_block_cm_fetch.csv', 'csv', rel=True, nrows=60, encoding='utf-8')


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
        f_path = os.path.join(PATH,"error_url_cm.csv")
        _data = pd.DataFrame([url], columns=['urls'])
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

        # sheet_data.drop(sheet_data.loc[sheet_data['date'].isin(
        #     remove_dates_list)].index, inplace=True)
        # append sheet data to existing df
        df = sheet_data.append(df, ignore_index=True, sort=True)
    return df

indicator_input = ['All']

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
        if indicator_input == ['All']:
            sub_df = sub_df
        else:
            sub_df = (sub_df[(sub_df['indicator_name'].isin(indicator_input))])
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
    remove_data_sub = df_district['subindicator_id'].unique().tolist()
    # Removing same date data if exists in csv sheet
    df_district = remove_common_dates_in_csv(remove_dates_list, sheet_name, df_district,remove_data_sub)

    # For yearly sub-indicators that are updated once in 5 years, we replicate the date across years
    # if area == 'district':
    #     df_district = replicate_indicator_2_year(remove_dates_list, df_district)

    # Final data To csv
    fpath = os.path.join(PATH, sheet_name)
    df_district.to_csv(fpath, index=False, encoding='utf-8')
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
            print(args, "District")
            fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
        if indicator_input_block:
            print(args, "Block")
            indicator_input = indicator_input_block
            fetch_district_data(fetching_dates, year_dates, BASE_URL, block_ids, 'block')
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        print("Error in fetch_cm_auto.trigger_fetch_process: ", e)
    return {"status":status, "error":error}
