import pandas as pd
import numpy as np
import gramex.cache
import requests
import os.path
import json
import os
import yaml
from datetime import datetime
from dateutil.relativedelta import relativedelta
import traceback
# logger = logging.getLogger(__name__)
PATH = os.path.dirname(__file__)

# for data fetching
organisation_unit = gramex.cache.open(
    'data/ou_id_mapping_updated.xlsx',
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'block_uid', 'block', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'uid_district', 'block_uid': 'uid_block'}, inplace=True)

# start_date = '2022-10-01'
# end_date  = '2022-11-01'
# get_year_date = ['2022']
# year_dates = [date[0:4] for date in get_year_date]
# date_range = pd.date_range(
#         start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# # print(date_range)
# dates = [date for date in date_range.strftime('%Y%m')]

# fetch_date_range = pd.date_range(
#         start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
# fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]



BASE_URL = 'https://uphmis.in/portalAPI/analytics.json'
district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())

sub_indicator_df = gramex.cache.open(
    'data/subindicator_fetch_district.csv',
    'csv',
    rel=True,
    nrows=100,
    encoding='utf-8'
)

sub_indicator_url_df = gramex.cache.open(
    'data/sub_indicator_url.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)

sub_indicator_df_block = gramex.cache.open(
    'data/subindicator_fetch_blocks.csv',
    'csv',
    rel=True,
    nrows=100,
    encoding='utf-8'
)
# print(sub_indicator_df_block)

# sub_blocks = gramex.cache.open(
#     'data/block_indicators.csv',
#     'csv',
#     rel=True,
#     nrows=60,
#     encoding='utf-8'
# )
# sub_dist = gramex.cache.open(
#     'data/district_indicators.csv',
#     'csv',
#     rel=True,
#     nrows=60,
#     encoding='utf-8'
# )

# print(sub_indicator_df)
# print(sub_blocks)
# print(sub_dist)

TOTAL_DISTRICTS = 75

# block_indicators = {
#         '% of pregnant women received 4 or more ANC against estimated PW' : 'ZpgnTGpSkeg.Ti9FJqkSK6J;TmeumlBaObG',
#         '% of pregnant women tested for Hb for 4 or more times against estimated PW' : 'ui45G8KwpzU.Ti9FJqkSK6J;TmeumlBaObG',
#         '% of pregnant women delivered in institution against estimated delivery' : 'aRueVYr35yM.Ti9FJqkSK6J;FRafAE8qFP6;ux6uaflq7xZ;g69FuEghiM5',
#         'Still birth ratio': 'mexWK5BLs5H.Ti9FJqkSK6J;aknlXIekL1Z.iRNhRMvoSCx;aknlXIekL1Z.wb51FJHqHxp',
#         '% of newborns received HBNC visits (Institutional Delivery & Home Delivery)' : 'kuz5MYYLyi2;aknlXIekL1Z',
#         'Ratio of Pentavalent 3 to BCG': 'OP5Q3Ga5V3T.aRNxGm8EkXJ;tN6dkfe6JLE.aRNxGm8EkXJ',
#         '% of children received full immunization (BCG, Penta 1, 2, 3, Measles)' : 'GJKYhq2wR9L;t03VPkJ5UXd',
#         'Permanent Method accepted per 1000 EC' : 'SCutWcJX88a.Ti9FJqkSK6J;jhdL4rNP5pA.Ti9FJqkSK6J;bOFAAIzcaGZ.Ti9FJqkSK6J;Xg1j0efNUrP.Ti9FJqkSK6J;n3L9KZq55UM.Ti9FJqkSK6J;OVLPx9JL7u7.Ti9FJqkSK6J;VJ2ccLnKQPv;Z0rXYfMQZST;yBfIJ7wBbcF',
#         'Reversible Method accepted per 1000 EC' : 'uTUcZv1fJfk.Ti9FJqkSK6J;YyUc4SanMDt.Ti9FJqkSK6J;NeNWp698eve.uBLH63dNSeY;A89WukjS845;OVLPx9JL7u7.Ti9FJqkSK6J;VJ2ccLnKQPv;Z0rXYfMQZST;yBfIJ7wBbcF',
#         '% of PW screened for HIV against estimated pregnancy' : 'NI0EC5no6PO;TmeumlBaObG',
#         'Per ASHA expenditure of ASHA incentive fund' : 'fyuGMPRH02k;jHHZKr89vwY',
#         'Availability of ASHA to total rural population' : 'IE5mCjFLxyl;MU3eO3SO5i9',
#         'Est Delivery load as per available Delivery Point' : 'g69FuEghiM5;Pw5SdRehu6Y',
#         'Est Delivery load as per available SBA trained staff Nurse / ANM' : 'g69FuEghiM5;h3YV0hOScfN.WMWuMvCRaFF; h3YV0hOScfN.vk4QB618zVQ'
# }

# district_indicators = {
#         '% of pregnant women received 4 or more ANC against estimated PW' : 'ZpgnTGpSkeg.Ti9FJqkSK6J;TmeumlBaObG',
#         '% of pregnant women tested for Hb for 4 or more times against estimated PW': 'ui45G8KwpzU.Ti9FJqkSK6J;TmeumlBaObG',
#         '% of pregnant women delivered in institution against estimated delivery' : 'aRueVYr35yM.Ti9FJqkSK6J;FRafAE8qFP6;ux6uaflq7xZ;g69FuEghiM5',
#         'Still birth ratio' : 'mexWK5BLs5H.Ti9FJqkSK6J;aknlXIekL1Z.iRNhRMvoSCx;aknlXIekL1Z.wb51FJHqHxp',
#         '% of newborns received HBNC visits (Institutional Delivery & Home Delivery)' : 'kuz5MYYLyi2;aknlXIekL1Z',
#         'Ratio of Pentavalent 3 to BCG': 'OP5Q3Ga5V3T.aRNxGm8EkXJ;tN6dkfe6JLE.aRNxGm8EkXJ',
#         '% of children received full immunization (BCG, Penta 1, 2, 3, Measles)' : 'GJKYhq2wR9L;t03VPkJ5UXd',
#         'Permanent Method accepted per 1000 EC' : 'SCutWcJX88a.Ti9FJqkSK6J;jhdL4rNP5pA.Ti9FJqkSK6J;bOFAAIzcaGZ.Ti9FJqkSK6J;Xg1j0efNUrP.Ti9FJqkSK6J;n3L9KZq55UM.Ti9FJqkSK6J;OVLPx9JL7u7.Ti9FJqkSK6J;VJ2ccLnKQPv;Z0rXYfMQZST;yBfIJ7wBbcF',
#         'Reversible Method accepted per 1000 EC' : 'uTUcZv1fJfk.Ti9FJqkSK6J;YyUc4SanMDt.Ti9FJqkSK6J;NeNWp698eve.uBLH63dNSeY;A89WukjS845;OVLPx9JL7u7.Ti9FJqkSK6J;VJ2ccLnKQPv;Z0rXYfMQZST;yBfIJ7wBbcF',
#         'Total case notification rate of TB against expected TB cases' : 'B2A7x36qEry;GXgfTS67qxe',
#         '% of PW screened for HIV against estimated pregnancy': 'NI0EC5no6PO;TmeumlBaObG',
#         'Per ASHA expenditure of ASHA incentive fund' : 'fyuGMPRH02k;jHHZKr89vwY',
# }

# print(fetch_date_range)
# print(dates)
# print(fetching_dates)
# print(year_dates)
# print(BASE_URL)
# print(district_ids)
# print(sub_indicator_df)
# print(sub_indicator_url_df)


# indicator_name = '% of pregnant women received 4 or more ANC against estimated PW'


# def fetch_indicator(indicator_name):
#         indicator = district_indicators[indicator_name]
#         print(indicator)
#         fetch_data(url , '')





# fetch_indicator(indicator_name)








































##################### fetching districts #######################


def fetch_data(url, indicator_mapping):
    """Make a http request and return data dictionary."""
    print(indicator_mapping)
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
        fpath = os.path.join(PATH,"error_url.csv")
        if os.path.exists(fpath):
            _data.to_csv(fpath, header=False, mode="a", index=False,
                         encoding='utf-8')
        else:
            _data.to_csv(fpath, index=False, encoding='utf-8')
        return {}
        # continue


def get_row_dict(data, date, i_type='all'):
    """Filter the data and returns row dictionary."""
    # import pdb; pdb.set_trace()
    dict_list = list()
    # df = pd.DataFrame()
    try:
        if (len(data['rows']) != 0):
            # # breakpoint()
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
                    organisation_unit.rename(columns = {'uid_district': 'district_id', 'uid_block': 'block_id'}, inplace=True)
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


def get_row_dict_2(data, date, i_type='all'):
    """Filter the data and returns row dictionary."""
    dict_list = list()
    # df = pd.DataFrame()
    # import pdb;pdb.set_trace()
    try:
        if (len(data['rows']) != 0):

            if (len(data['rows'][0]) == 3):
                import pdb; pdb.set_trace();
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
                # import pdb; pdb.set_trace();
                for d in data['rows']:
                    # try:
                    # dic_ = data['metaData']['names']
                    dict_list.append({
                        'date': date,
                        'subindicator_id': 'aRueVYr35yM.Ti9FJqkSK6J',
                        'district_id': d[2],
                        'district': '',
                        'value': d[3]
                    })
                    # except KeyError:

                        # dic_ = data['metaData']['items']
                        # dict_list.append({
                        #     'date': date,
                        #     'subindicator_id': d[0],
                        #     'district_id': d[1],
                        #     'district': dic_[d[1]]['name'].strip(),
                        #     'value': d[3]
                        # })
                df = pd.DataFrame(dict_list)
                if (i_type != 'one'):
                    organisation_unit.rename(columns = {'uid_district': 'district_id', 'uid_block': 'block_id'}, inplace=True)
                    # # breakpoint()
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


def fetch_indicator_3_data_new(dates, base_url, district_ids):
    """Fetching indicator 3 data."""
    df = pd.DataFrame()

    district_ids_array = district_ids.split(';')

    for date in dates:
        for index, sub_indicator in sub_indicator_url_df.iterrows():
            # fetching for all districts indicator 3a and 3b
            if sub_indicator['params'] == 'all':
                url = sub_indicator['url'].format(district_ids, date)
                data = fetch_data(url, '')
                temp_df = pd.DataFrame(data['rows'], columns=[
                    'subindicator_id', 'xyz', 'district_id', 'date', 'value'])
                temp_df['subindicator_id'] = sub_indicator['subindicator_id']
                del temp_df['xyz']
                if(temp_df.shape[0] < TOTAL_DISTRICTS):
                    excluded_districts = list(set(district_ids_array) -
                                              set(temp_df['district_id'].tolist()))

                    for d in excluded_districts:
                        temp_df = temp_df.append({
                            'subindicator_id': sub_indicator['subindicator_id'],
                            'district_id': d,
                            'date': date,
                            'value': 0
                        }, ignore_index=True)

                df = df.append(temp_df)

            # fetching data for 3c and 3d
            else:
                temp_df = pd.DataFrame(
                    columns=[
                        'subindicator_id',
                        'district_id',
                        'date',
                        'value'])
                for district_id in district_ids_array:
                    url = sub_indicator['url'].format(district_id, date)
                    data = fetch_data(url, '')
                    if 'rows' in data.keys():
                        if (len(data['rows']) > 0):
                            temp_df = temp_df.append({
                                'subindicator_id': sub_indicator['subindicator_id'],
                                'district_id': district_id,
                                'date': date,
                                'value': data['rows'][0][4]
                            }, ignore_index=True)
                        else:
                            temp_df = temp_df.append({
                                'subindicator_id': sub_indicator['subindicator_id'],
                                'district_id': district_id,
                                'date': date,
                                'value': 0
                            }, ignore_index=True)
                df = df.append(temp_df)
    return df

def indicator_13_14(dates, indicator_id, mapping_id):
    df = pd.DataFrame()
    print('indi 13')
    date = dates[-1]
    k = datetime.strptime(date, '%Y%m')
    start_date= datetime.strftime(k, '%Y%m%d')
    next_month = k + relativedelta(months=1, day=1)
    final_date = datetime.strftime(next_month,'%Y%m%d')
    # breakpoint()
    for date in dates:
        # url = ""
        print("*****check*****",'V6xEBMwRNFh')
        url = 'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}\
        &var=ed:{}&paging=false'.format('V6xEBMwRNFh', start_date, final_date)
        # # breakpoint()
        data = fetch_data(url, 'indicator_13_14')
        df_list = list()
        for d in data['listGrid']['rows']:
            df_list.append({
                'date': date,
                'district': d[0].strip() if indicator_id == 'indicator_14' else d[1].strip(),
                'district_id': d[1] if indicator_id == 'indicator_14' else d[0],
                'indicator_id': indicator_id,
                'perc_point': d[4]
            })
        df = df.append(pd.DataFrame(df_list), ignore_index=True)
    fpath = os.path.join(PATH,'data',indicator_id+'_data.csv')

    if os.path.exists(fpath):
        ''' Removing same date data if exists '''
        remove_data = df['date'].unique().tolist()
        filter_data = pd.read_csv(fpath, encoding='utf-8')
        filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
                         inplace=True)
        df = filter_data.append(df, ignore_index=True, sort=True)
    df.loc[df['perc_point'] > 100, 'perc_point'] = 100

    df.to_csv(
        fpath,
        index=False,
        encoding='utf-8')

def indicator_14(dates, indicator_id, mapping_id):
    df = pd.DataFrame()
    date = dates[-1]
    k = datetime.strptime(date, '%Y%m')
    strt_date= datetime.strftime(k, '%Y%m%d')
    res = k + relativedelta(day=31)
    final_date = datetime.strftime(res, '%Y%m%d')

    for date in dates:
        # url = ""
        url = 'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}\
        &var=ed:{}&paging=false'.format('ESCUlkasHlO', strt_date, final_date)
        data = fetch_data(url, 'indicator_13_14')
        # # breakpoint()
        df_list = list()
        # breakpoint()
        for d in data['listGrid']['rows']:
            df_list.append({
                'date': date,
                'district': d[0].strip() if indicator_id == 'indicator_14' else d[1].strip(),
                'district_id': d[1] if indicator_id == 'indicator_14' else d[0],
                'indicator_id': indicator_id,
                'perc_point': d[4]
            })
        df = df.append(pd.DataFrame(df_list), ignore_index=True)
    # # breakpoint()
    f_path = os.path.join(PATH,'data',indicator_id+'_data.csv')
    if os.path.exists(f_path):
        ''' Removing same date data if exists '''
        remove_data = df['date'].unique().tolist()
        filter_data = pd.read_csv(f_path, encoding='utf-8')
        filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
                         inplace=True)
        df = filter_data.append(df, ignore_index=True, sort=True)
    df.loc[df['perc_point'] > 100, 'perc_point'] = 100
    df.to_csv(
        f_path,
        index=False,
        encoding='utf-8')

nodata_subindicator_list_district = list()
indicator_input = ['All']

def fetch_district_data(dates,year_dates, base_url, district_ids):
    """Fetching district level data."""
    print("dates",dates)
    print("year_dates", year_dates)
#     logger.info('*' * 10 + 'fetching district data' + '*' * 10)
    df_district = pd.DataFrame()
    # import pdb;
    # pdb.set_trace();
    # fetching monthly data
    for date in dates:
        print(date)
        temp_df = pd.DataFrame()
        if indicator_input == ['All']:
            indicator_list = (sub_indicator_df[
                    sub_indicator_df['period'].isin(['Monthly']) &
                    sub_indicator_df['indicator_type'].isin(['indicator'])]
                    .drop_duplicates())
        else:
            indicator_list = (sub_indicator_df[
                    sub_indicator_df['period'].isin(['Monthly']) &
                    sub_indicator_df['indicator_type'].isin(['indicator']) &
                    sub_indicator_df['indicator_name'].isin(indicator_input)]
                    .drop_duplicates())
        # print("indi",indicator_list['subindicator_id'])
        # breakpoint()

        for index, row in indicator_list.iterrows():
            print(row['subindicator_id'])
            subindicator_id = row['subindicator_id']
            period = row['period']
            indicator_type = row['indicator_type']
            if (period == 'Monthly' and indicator_type == 'indicator'):
                param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
                    .format(subindicator_id, district_ids, date)
                url = base_url + param_url
            data = fetch_data(url, '')
            # if len(data) != 0:
            temp_df = temp_df.append(get_row_dict(data, date), ignore_index=True, sort=True)
            nodata_subindicator_list_district.append({'subindicator_id': subindicator_id,
                                                      'date': date,
                                                      'number_of_districts': len(data['rows'])})
        # temp_df.drop(temp_df.query('subindicator_id == "aRueVYr35yM.Ti9FJqkSK6J"').index, inplace=True)
        temp_df = temp_df[temp_df['subindicator_id'] != 'aRueVYr35yM.Ti9FJqkSK6J']

        param_url = "?dimension=dx:aRueVYr35yM.Ti9FJqkSK6J&dimension=aDI5f2TIgXx:mgnmdIRKpzA&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
            .format(district_ids, date)
        url = base_url + param_url
        # # breakpoint()

        data = fetch_data(url, '')
        if indicator_input == ['% of pregnant women delivered in institution against estimated delivery'] or indicator_input == ['All']:
            temp_df = temp_df.append(get_row_dict_2(data, date), ignore_index=True, sort=True)
        # # breakpoint()
        df_district = df_district.append(temp_df, ignore_index=True, sort=True)

    # fetching yearly data

    for year in year_dates:
        print(year)
        if indicator_input == ['All']:
            yearly_df = sub_indicator_df[sub_indicator_df['period']
                                    == 'Yearly'].drop_duplicates()
        else:
            yearly_df = (sub_indicator_df[sub_indicator_df['period'].isin(['Yearly'])&
                    sub_indicator_df['indicator_name'].isin(indicator_input)]
                    .drop_duplicates())
        temp_df = pd.DataFrame()

        for index, row in yearly_df.iterrows():
            print(row['subindicator_id'])
            subindicator_id = row['subindicator_id']
            period = row['period']
            indicator_type = row['indicator_type']
            if (period == 'Yearly' and indicator_type == 'indicator'):
                param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
                    .format(subindicator_id, district_ids, year)
                url = base_url + param_url
                # print (url)

            data = fetch_data(url, '')

            nodata_subindicator_list_district.append({'subindicator_id': subindicator_id,
                                                    'date': year,
                                                    'number_of_districts': len(data['rows'])})
            temp_df = temp_df.append(get_row_dict(data, year), ignore_index=True, sort=True)
        df_district = df_district.append(temp_df, ignore_index=True, sort=True)


    # fetching indicator 3 data
    if indicator_input == ['% of C-section delivery against reported delivery (70% weightage to CHC and 30% to DH)'] or indicator_input == ['All']:
        df_district = df_district.append(
            fetch_indicator_3_data_new(
                dates, base_url, district_ids), ignore_index=True, sort=True)

    # import pdb; pdb.set_trace()

    fpa = os.path.join(PATH,'data','subindicator_scores_districts.csv')
    if os.path.exists(fpa):
        ''' Removing same date data if exists '''
        # import pdb; pdb.set_trace()
        remove_data = df_district['date'].unique().tolist()
        remove_data_sub = df_district['subindicator_id'].unique().tolist()
        # remove_data = np.unique(df_district[['date', 'subindicator_id']].values).tolist()
        filter_data = pd.read_csv(fpa, encoding='utf-8')
        # filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
        #                  inplace=True)
        filter_data.drop(filter_data.loc[(filter_data['date'].isin(remove_data))& (filter_data['subindicator_id'].isin(remove_data_sub))].index,inplace=True)
        df_district = filter_data.append(df_district, ignore_index=True, sort=True)

    # For yearly sub-indicators that are updated once in 5 years, we replicate the date across years
    # Year array
    year_array = [x for x in remove_data if len(x)==4]
    # 5 year indicators for which data needs to be generated
    # removed 'FRafAE8qFP6', 'ux6uaflq7xZ' on 26-05-2022
    re = [ 'cB6y5lovUZX.Ti9FJqkSK6J', 'LQRtOv7IQrQ.Ti9FJqkSK6J']

    # Remove entries for 2019 for re(4) indicators in current df
    df_district = df_district.loc[~ (df_district['subindicator_id'].isin(re)& df_district['date'].isin(year_array)) ]
    # Get 2017 data from df
    df_2017 = df_district.loc[ (df_district['subindicator_id'].isin(re)& df_district['date'].isin([2017])) ]

    # Append replicated data with changed dates
    for x in year_array:
        df_test_2017  = df_2017
        df_test_2017 = df_test_2017.replace(2017,x )
        df_district = df_district.append(df_test_2017)

    file_path = os.path.join(PATH,'data','subindicator_scores_districts.csv')

    df_district.to_csv(
        file_path,
        index=False,
        encoding='utf-8')

    if indicator_input == ['All'] or indicator_input == ['% of facilities reported outlier for the identified indicators of ranking']:
        indicator_14(dates, 'indicator_14', 'indicator_mappings')
    if indicator_input == ['All'] or indicator_input == ['% of facilities reported non blank value (including zero) for the identified indicators of ranking']:
        indicator_13_14(dates, 'indicator_13', 'indicator_mappings')
    # indicator_13_14_other(dates, 'indicator_13', 'indicator_mappings')

    return df_district





########### Block fetching ####################

def get_data_from_api(config, start_date, end_date, sub_indicator_id, indicator):
    """Get the data from api"""
    # url
    start_date = pd.to_datetime(start_date, format='%Y-%m-%d').strftime('%Y%m')
    end_date = pd.to_datetime(end_date, format='%Y-%m-%d').strftime('%Y%m')
    # url = config['_url'].format(sub_indicator_id, 202002, 202004)
    url = config['url'].format(sub_indicator_id, start_date, end_date)
    # auth_details
    auth_details = config['auth_details']
    # # breakpoint()
    try:
        user_pass = os.environ[auth_details['user_pass']
                               ] if auth_details[
                                   'user_pass'] in os.environ else auth_details['user_pass']
        api_response = requests.get(url, auth=(auth_details['user_name'], user_pass))
        if not api_response.status_code // 100 == 2:
            # Consider any status other than 2xx an error
            error = "Error: Unexpected response {}".format(api_response)
            error_json = {"error_type": [error], "url": [url]}
            exception_df = pd.DataFrame(error_json)
            write_df(exception_df, config['exception_filename'])
        # # breakpoint()

        api_response_text = json.loads(api_response.text)
        # import pdb; pdb.set_trace()
        header_object = api_response_text['listGrid']['headers']
        data = api_response_text['listGrid']['rows']
        headers = []
        for item in header_object:
            headers.append(item['column'])
        final_data = pd.DataFrame(data, columns=headers)
        # # breakpoint()
        final_data['date'] = start_date
        final_data['end_date'] = end_date
        final_data['indicator_id'] = indicator
        final_data = final_data.rename(columns=config['columns_rename'])
        final_data = final_data.rename(columns={'perc': 'perc_point'})
        final_data = final_data.rename(columns={'blockuid':'block_id'})
        final_data = final_data.rename(columns={'ouuid':'block_id'})
        final_data = final_data[['date', 'indicator_id', 'block_id', 'perc_point']]
        # # breakpoint()
        write_df(final_data, indicator+"_data.csv")
    except requests.exceptions.RequestException as e:
        # exceptions like an SSLError or InvalidURL
        error = "Error: {}".format(e)
        error_json = {"error_type": [error], "url": [url]}
        exception_df = pd.DataFrame(error_json)
        write_df(exception_df, config['exception_filename'])

# def run_api_script_other():
#     """run the date loop"""
#     check_file = os.path.isfile('config.yaml')
#     if check_file:
#         with open("config.yaml", 'r', encoding='utf-8') as stream:
#             try:
#                 config = yaml.load(stream)
#                 date_object = config['date']
#                 same_year = date_object['from']['year'] == date_object['to']['year']
#                 end_month = date_object['to']['month'] if same_year else None
#                 date_object = {'from': date_object['from']} if same_year else date_object
#                 for key in date_object:
#                     year = date_object[key]['year']
#                     year_ = year
#                     month = 1 if key == "to" else date_object[key]['month']
#                     if same_year is False:
#                         end_month = 12 if key == "from" else date_object[key]['month']
#                     print(type(end_month), type(month))
#                     month = int(month)
#                     end_month = int(end_month)
#                     print(type(end_month), type(month))
#                     while month <= end_month:
#                         # end_day = monthrange(year, month)[1]
#                         month = int(month)
#                         start_date = "{}-{}".format(year, month)
#                         # import pdb; pdb.set_trace()
#                         if month == 10:
#                             month_ = 12
#                             year_ = year+1
#                             # if year == 2018:
#                             #     year_ = 2019
#                         elif month == 11:
#                             month_ = 1
#                             year_ = year+1
#                             # if year == 2018:
#                             #     year_ = 2019
#                         elif month == 12:
#                             month_ = 2
#                             year_ = year+1
#                             # if year == 2018:
#                             #     year_ = 2019
#                         elif month <= 9:
#                             month_ = month + 3

#                         end_date = "{}-{}".format(year_, month_)
#                         print('********',start_date, end_date)
#                         get_data_from_api(config, start_date, end_date,
#                                           'O9dvHAPcmkh', 'indicator_16')
#                         month += 1
#                 # print("done")
#             except yaml.YAMLError as exc:
#                 # print(exc)
#                 return
#     else:
#         # print("please add the config.yaml for the script")
#         return



def run_api_script(config):
    """run the date loop"""
    # check_file = os.path.isfile('config.yaml')
    # if check_file:
    #     with open("config.yaml", 'r', encoding='utf-8') as stream:
    try:
        # config = yaml.safe_load(stream)
        date_object = config['date']
        same_year = date_object['from']['year'] == date_object['to']['year']
        end_month = date_object['to']['month'] if same_year else None
        date_object = {'from': date_object['from']} if same_year else date_object
        # # breakpoint()
        for key in date_object:
            year = date_object[key]['year']
            year_ = year
            month = 1 if key == "to" else date_object[key]['month']
            if same_year is False:
                end_month = 12 if key == "from" else date_object[key]['month']
            print(type(end_month), type(month))
            month = int(month)
            end_month = int(end_month)
            print(type(end_month), type(month))
            while month <= end_month:
                # end_day = monthrange(year, month)[1]
                month = int(month)
                start_date = "{}-{}".format(year, month)
                # import pdb; pdb.set_trace()
                if month == 10:
                    month_ = 12
                    year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                elif month == 11:
                    month_ = 1
                    year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                elif month == 12:
                    month_ = 2
                    year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                elif month <= 9:
                    month_ = month + 3

                end_date = "{}-{}".format(year_, month_)
                print('********',start_date, end_date)
                # # breakpoint()
                get_data_from_api(config, start_date, end_date,
                                  'O9dvHAPcmkh', 'indicator_16')
                month += 1
                # print("done")
    except yaml.YAMLError as exc:
        # print(exc)
        return
    # else:
    #     # print("please add the config.yaml for the script")
    #     return


def write_df(df, file_name):
    """Write the csv file"""
    # check_file = os.path.isfile(file_name)
    # # print(os.path)
    # if check_file:
    #     prev_data = pd.read_csv(file_name, encoding='utf-8')
    #     final_data = pd.concat([prev_data, final_data])
    # final_data.to_csv(file_name,  encoding='utf-8', index=False)

    # If date column not a object string, convert to string
    if (df['date'].dtype != 'O'):
        df['date'] = df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    f_pa = os.path.join(PATH,'data',file_name)
    if os.path.exists(f_pa):
        ''' Removing same date data if exists '''
        remove_data = df['date'].unique().tolist()
        filter_data = pd.read_csv(f_pa, encoding='utf-8')
        filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
                         inplace=True)
        df = filter_data.append(df, ignore_index=True, sort=True)
    df.to_csv(
        f_pa,
        index=False,
        encoding='utf-8')




def run_api_script_15(config):
    """run the date loop"""
    # check_file = os.path.isfile('config.yaml')
    # if check_file:
    #     with open("config.yaml", 'r', encoding='utf-8') as stream:
    try:
        # config = yaml.safe_load(stream)
        date_object = config['date']
        same_year = date_object['from']['year'] == date_object['to']['year']
        end_month = date_object['to']['month'] if same_year else None
        date_object = {'from': date_object['from']} if same_year else date_object
        # # breakpoint()
        for key in date_object:
            year = date_object[key]['year']
            month = 1 if key == "to" else int(date_object[key]['month'])
            if same_year is False:
                end_month = 12 if key == "from" else int(date_object[key]['month'])
            month = int(month)
            end_month = int(end_month)
            print(type(end_month), type(month))
            # # breakpoint()
            while month <= end_month:
                start_date = "{}-{}".format(year, month)
                end_date = "{}-{}".format(year, month)
                        # print(start_date, end_date)
                # # breakpoint()
                get_data_from_api(config, start_date, end_date,
                                  'q0RpwJhtGzS', 'indicator_15')
                month += 1
                # print("done")
    except yaml.YAMLError as exc:
        return
    # else:
    #     return

# run_api_script()


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

indicator_input_block = ['All']

def fetch_block_data(dates, year_dates, sub_indicator_df, base_url, block_ids):
    """Fetching block level data."""
    # logger.info('*' * 10 + 'fetching blocks data' + '*' * 10)
    date = dates[-1]
    k = datetime.strptime(date, '%Y%m')
    from_year = datetime.strftime(k, '%Y')
    from_month = datetime.strftime(k, '%m')
    to_year = datetime.strftime(k, '%Y')
    to_month = datetime.strftime(k, '%m')
    config = {'date' : {'from': {'year': from_year, 'month': from_month}, 'to': {'year': to_year, 'month': to_month}},
                'url':'https://uphmis.in/uphmis/api/sqlViews/{}/data.json?var=sd:{}01&var=ed:{}28&paging=false',
                'auth_details' : {'user_name': 'Gramener', 'user_pass': 'Gramener@123'},
                'exception_filename' : 'exception.csv',
                'columns_rename' : {'name': 'block', 'block': 'block_id', 'completeness_percentage': 'perc_point'}}

    df_blocks = pd.DataFrame()
    for date in dates:
        print(date)
        temp_df = pd.DataFrame()
        if indicator_input_block == ['All']:
            monthly_df = sub_indicator_df[sub_indicator_df['period']
                                        == 'Monthly'].drop_duplicates()
        else:
            monthly_df = (sub_indicator_df[(sub_indicator_df['period']== 'Monthly')&
                    sub_indicator_df['indicator_name'].isin(indicator_input_block)].drop_duplicates())
        # # breakpoint()

        for index, row in monthly_df.iterrows():
            print(row['subindicator_id'])
            subindicator_id = row['subindicator_id']
            period = row['period']
            indicator_type = row['indicator_type']
            if (period == 'Monthly' and indicator_type == 'indicator'):
                param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
                    .format(subindicator_id, block_ids, date)
                url = base_url + param_url
            data = fetch_data(url, '')
            try:
                get_df = pd.DataFrame()
                get_df = get_df.append(get_row_dict(data, date))
                temp_df = temp_df.append(get_df)
            except KeyError:
                continue

        # import pdb; pdb.set_trace();

        # import pdb; pdb.set_trace()

        # temp_df.drop(temp_df.query('subindicator_id == "aRueVYr35yM.Ti9FJqkSK6J"').index, inplace=True)
        temp_df = temp_df[temp_df['subindicator_id'] != 'aRueVYr35yM.Ti9FJqkSK6J']
        param_url = "?dimension=dx:aRueVYr35yM.Ti9FJqkSK6J&dimension=aDI5f2TIgXx:mgnmdIRKpzA&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
            .format(block_ids, date)
        # # breakpoint()
        url = base_url + param_url
        data = fetch_data(url, '')
        get_df = pd.DataFrame()
        if indicator_input_block == ['% of pregnant women delivered in institution against estimated delivery'] or indicator_input == ['All']:
            get_df = get_df.append(get_row_dict_2(data, date))
        temp_df = temp_df.append(get_df)
        df_blocks = df_blocks.append(temp_df)
        # print(len(temp_df))
        if indicator_input_block == ['Est Delivery load as per available Delivery Point'] or indicator_input_block == ['All']:
            df_blocks = df_blocks.append(get_indicator_13_data(date), ignore_index=True, sort=True)
        # print(df_blocks)
    for year in year_dates:
        print(year)
        if indicator_input_block == ['All']:
            yearly_df = sub_indicator_df[sub_indicator_df['period']
                                    == 'Yearly'].drop_duplicates()
        else:
            yearly_df = (sub_indicator_df[sub_indicator_df['period'].isin(['Yearly'])&
                    sub_indicator_df['indicator_name'].isin(indicator_input_block)]
                    .drop_duplicates())
        for index, row in yearly_df.iterrows():
            print(row['subindicator_id'])
            temp_df = pd.DataFrame()
            subindicator_id = row['subindicator_id']
            period = row['period']
            indicator_type = row['indicator_type']
            if (period == 'Yearly' and indicator_type == 'indicator'):
                param_url = "?dimension=dx:{}&dimension=ou:{}&filter=pe:{}&displayProperty=NAME"\
                    .format(subindicator_id, block_ids, year)
                url = base_url + param_url
            data = fetch_data(url, '')
            try:
                get_df = pd.DataFrame()
                get_df = get_df.append(get_row_dict(data, year))
                temp_df = temp_df.append(get_df)
                df_blocks = df_blocks.append(temp_df)
            except KeyError:
                continue

    fi_pa = os.path.join(PATH,'data','subindicator_scores_blocks.csv')
    if os.path.exists(fi_pa):
        ''' Removing same date data if exists '''
        # import pdb; pdb.set_trace()
        remove_data = df_blocks['date'].unique().tolist()
        remove_data_sub = df_blocks['subindicator_id'].unique().tolist()
        filter_data = pd.read_csv(fi_pa, encoding='utf-8')
        # filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
        #                  inplace=True)
        filter_data.drop(filter_data.loc[(filter_data['date'].isin(remove_data))& (filter_data['subindicator_id'].isin(remove_data_sub))].index,inplace=True)
        df_blocks = filter_data.append(df_blocks, ignore_index=True, sort=True)

    df_blocks.to_csv(
            fi_pa,
            index=False,
            encoding='utf-8')

    if indicator_input_block == ['All'] or indicator_input_block == ['% of facilities reported non blank value (including zero) for the identified indicators of ranking']:
        print('yes')
        run_api_script_15(config)
    if indicator_input_block == ['All'] or indicator_input_block == ['% of facilities reported outlier for the identified indicators of ranking']:
        print('yes2')
        run_api_script(config)

    # block_15_16.run_api_script_other()



# fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
# fetch_block_data(fetching_dates, year_dates, sub_indicator_df_block, BASE_URL, block_ids)

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
            start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]

    indicator_input = args.get('district_indicator_ids[]') if args.get('district_indicator_ids[]') else []
    indicator_input_block = args.get('block_indicator_ids[]') if args.get('block_indicator_ids[]') else []
    try:
        if indicator_input:
            print(args, "dio")
            # fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
        if indicator_input_block:
            print(args, "bl")
            # fetch_block_data(fetching_dates, year_dates, sub_indicator_df_block, BASE_URL, block_ids)
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        print("Error in uphealth_automation.trigger_fetch_process: ", e)
    return {"status":status, "error" : error}
