


"""Main etl file."""
import logging
import calculations as calc
import block_level_indicator_15_16 as block_15_16
import block_level_qa_yr as calc1
import gramex.cache
import pandas as pd
import numpy as np
import urllib3
import sys
import os.path
from datetime import datetime
from dateutil.relativedelta import relativedelta

"""
This is a main file running this file for creating final distrct scores and block scores csv
files.
This file have dependency on calculations.py, indicator_13_calculation.py, indicator_13_outlier.py,
config.yaml
1. calculations.py contains calculations methods for all indicator methods and data fetch methods
for indicator 3 and 14.
2. indicator_13_outlier.py file fetch data for indicator 13 and saves to csv.
3. indicator_13_calculation.py calculates final results and save to csv.
4. config.yaml contains configs and formaulae for 13 indicator
"""
PATH = os.path.dirname(__file__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('message')

config = gramex.cache.open('config.yaml', 'yaml', rel=True)



"""
All the 14 indicators names, ids and type/domain mapping are present in indicator_id_mappings.csv
"""
indicators_df = gramex.cache.open(
    'data/indicator_id_mapping.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)


"""
All the 14 indicators names, ids and type/domain mapping are present
in indicator_id_mapping_block.csv
"""
indicators_df_block = gramex.cache.open(
    'data/indicator_id_mapping_block.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)
"""
Organisatoin unit contains all organisation(district/block/division/facility) ID's and name.
"""
#  old file
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH, 'data', 'ou_id_mappings.csv'),
#     'csv',
#     rel=True,
#     encoding='utf-8'
# )[['uid_district', 'district', 'uid_division', 'division', 'uid_block', 'block', 'facility']]

# for data fetching
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
#     'xlsx',
#     rel=True,
#     encoding='utf-8'
# )[['district_uid', 'district', 'block_uid', 'block', 'facility']]
# organisation_unit.rename(columns = {'district_uid': 'uid_district', 'block_uid': 'uid_block'}, inplace=True)


# for calculations
organisation_unit = gramex.cache.open(
    'data/ou_id_mapping_updated.xlsx',
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'updated_block_uid', 'updated_block_name', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'uid_district', 'updated_block_uid': 'uid_block', 'updated_block_name': 'block'}, inplace=True)


district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())
# division_ids = ';'.join(organisation_unit['uid_division'].unique())

# print(block_ids)

sub_indicator_df = gramex.cache.open(
    'data/subindicator_fetch_district.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)

sub_indicator_df_block = gramex.cache.open(
    'data/subindicator_fetch_blocks.csv',
    'csv',
    rel=True,
    nrows=60,
    encoding='utf-8'
)
"""
Division map ids are present in division_map_id.csv
"""
division_map_ids = gramex.cache.open(
    'data/division_map_id.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)

"""
District map ids are present in district_map_id.csv
"""
district_map_ids = gramex.cache.open(
    'data/district_map_id.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)
indicator_name = config['indicator_name']
BASE_URL = config['api']['base_url']


def calculate_scores(dates,year_dates,area = 'district'):
    # import pdb
    print(area,"area"*30)
    # import pdb;
    # pdb.set_trace();
    """Calculate final scores."""
    df_district_scores = pd.DataFrame()
    if area == 'district':
        fpath = os.path.join(PATH,"data","subindicator_scores_districts.csv")
        data = pd.read_csv(fpath,encoding='utf-8')
    else:
        fpath = os.path.join(PATH,"data","subindicator_scores_divisions.csv")
        data = pd.read_csv(fpath,encoding='utf-8')

    for date in dates:
        # gramex.config.app_log(date)
        print(date)
        df_district_scores = df_district_scores.append(
            calc.indicator_1(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_2(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_31(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_32(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_4(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_5(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_6(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_7(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_8(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_9(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_10(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_11(date, data, 'indicator_mappings'))
        df_district_scores = df_district_scores.append(
            calc.indicator_12(date, data, 'indicator_mappings'))
        print (date, "done")
        print('indicator done my coment ---------------=================')

    # pdb.set_trace();

    if area== 'district':
        total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
    else:
        # total_districts = organisation_unit[['uid_division', 'division', 'district', 'uid_district']].drop_duplicates().reset_index()
        total_districts = organisation_unit[['uid_division', 'division']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_division': 'district_id','division': 'district'}, inplace=True)
        # df_district_scores.rename(index=str, columns={'district_id': 'division_id'}, inplace=True)

    del total_districts['index']
    df_district_scores.reset_index(inplace=True)
    # pdb.set_trace();
    # import pdb; pdb.set_trace()
    df_district_scores = pd.merge(df_district_scores, total_districts, on='district_id')

    if area == 'district':
        fpath_14 = os.path.join(PATH,"data","indicator_14_data.csv")
        fpath_13 = os.path.join(PATH,"data","indicator_13_data.csv")
        indicator_14 = pd.read_csv(fpath_14, encoding='utf-8')
        indicator_13 = pd.read_csv(fpath_13, encoding='utf-8')

        df_district_scores = df_district_scores.append(indicator_13[indicator_13['date'].isin(dates)])
        df_district_scores = df_district_scores.append(indicator_14[indicator_14['date'].isin(dates)])
        f_path = os.path.join(PATH,"qwer.csv")

        df_district_scores.to_csv(f_path)

        df_district_scores = pd.merge(df_district_scores, district_map_ids[['district_id', 'map_id']], on='district_id')
        df_district_scores = pd.merge(df_district_scores, division_map_ids, on='district')
    # import pdb; pdb.set_trace()
    df_district_scores = pd.merge(df_district_scores, indicators_df, on='indicator_id')

    # pdb.set_trace()

    df_district_scores['date'] = df_district_scores['date'].apply(str)
    df1 = pd.DataFrame()
    df2 = pd.DataFrame()
    df_all = pd.DataFrame()
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    # df_district_scores.loc[
    #     df_district_scores['perc_point'] > 100, 'perc_point'] = 100

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point']*0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point']*0.3


    df_district_scores = calc.calculate_indicator_index(df_district_scores)
    # pdb.set_trace()
    df_district_scores = calc.calculate_type_index(df_district_scores)
    df_district_scores = calc.calculate_domain_index(df_district_scores)
    df_district_scores = calc.calculate_compostite_score(df_district_scores)
    df_district_scores = calc.calculate_ranks(df_district_scores)

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point'] / 0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point'] / 0.3

    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3

    df_district_scores['date'] = df_district_scores['date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['quarter'] = df_district_scores['date'].apply(add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)



    if(area == 'division'):
        # df_district_scores.rename(columns={'district_id': 'division_id', 'uid_district': 'district_id'},inplace=True)
        df_district_scores.rename(columns={'district_id': 'division_id', 'district':'division'},inplace=True)
        # df_district_scores = pd.merge(df_district_scores, district_map_ids[['district_id', 'map_id']], on='district_id')
        # df_district_scores = pd.merge(df_district_scores, division_map_ids, on='district')
        # import pdb
        # pdb.set_trace();
        # division_map_ids = division_map_ids[['division', 'div_map_id']]
        df_district_scores = pd.merge(df_district_scores, division_map_ids[['division', 'div_map_id']].drop_duplicates(), on='division')
        # import pdb;
        # pdb.set_trace();
        # df_district_scores.drop(columns=['division_y'], axis=1,inplace=True)
        # df_district_scores.rename(columns={'division_x': 'division'},inplace=True)

    # pdb.set_trace()


    # To csv
    if area == 'district':
        calc.write_df(df_district_scores, 'district_scores.csv')
    else:
        calc.write_df(df_district_scores, 'division_scores.csv')


block_map_ids = gramex.cache.open(
    'data/block_map_id.csv',
    'csv',
    rel=True,
    encoding='utf-8'
)



def calculate_scores_block(dates,year_dates):
    """Calculate final scores."""
    fpath_15 = os.path.join(PATH,"data","indicator_15_data.csv")
    fpath_16 = os.path.join(PATH,"data","indicator_16_data.csv")
    df_ind_15 = pd.read_csv(fpath_15, encoding='utf-8')
    df_ind_16 = pd.read_csv(fpath_16, encoding='utf-8')
    df_district_scores = pd.DataFrame()
    data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_blocks.csv"), encoding='utf-8')
    # import pdb; pdb.set_trace();
    data.drop(data.loc[data['subindicator_id'].isin(['t03VPkJ5UXd.Ti9FJqkSK6J'])].index, inplace=True)
    data = data.append(calc.get_nfhs_data(year_dates, dates), ignore_index=True)
    # # breakpoint()
    for date in dates:
        print("innnnnnnnnnnnn.........",date)
        df_district_scores = df_district_scores.append(
            calc.indicator_1(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_2(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_3(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_4(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_5(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_6(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_7(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_8(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_9(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_10_block(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_11(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_12(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_131(date, data, 'indicator_mappings_block'))
        df_district_scores = df_district_scores.append(
            calc.indicator_141(date, data, 'indicator_mappings_block'))
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    # # breakpoint()
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    # df_district_scores.loc[df_district_scores['perc_point'] > 100, 'perc_point'] = 100
    df_district_scores.dropna(inplace=True)
    df_district_scores.reset_index(inplace=True)
    df_district_scores.rename(index=str, columns={'district_id': 'block_id'}, inplace=True)
    # df_district_scores = df_district_scores1.append(df_district_scores)
    # import pdb;pdb.set_trace()
    df_district_scores = df_district_scores.append(df_ind_15[df_ind_15['date'].isin(dates)])
    df_district_scores = df_district_scores.append(df_ind_16[df_ind_16['date'].isin(dates)])
    total_districts = organisation_unit[[
        'uid_district', 'district', 'uid_block', 'block']].drop_duplicates().reset_index()
    total_districts.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    del total_districts['index']
    organisation_unit_ = organisation_unit[['uid_block', 'facility']].groupby(
        ['uid_block']).size().reset_index()

    df_district_scores.reset_index(inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, total_districts, on='block_id')
    organisation_unit_.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, organisation_unit_, on='block_id')
    del df_district_scores['index']
    # df_district_scores = df_district_scores.append(calc.indicator_14(data))
    # df_district_scores = df_district_scores.append(calc.indicator_13())
    block_map_ids.rename(
        columns={
            'organisationunitid': 'block_id',
            'id_Shp_file': 'map_id'},
        inplace=True)

    df_district_scores = pd.merge(
        df_district_scores, block_map_ids[['block_id', 'map_id']],
        on='block_id')
    df_district_scores = pd.merge(
        df_district_scores,
        division_map_ids,
        on='district')
    df_district_scores = pd.merge(
        df_district_scores, indicators_df_block, on='indicator_id')
    df_district_scores['date'] = df_district_scores['date'].apply(str)
    df_district_scores.to_csv('core_df.csv')
    df_district_scores = calc.calculate_indicator_index_block(
        df_district_scores)
    print("0000000000000")

    df_district_scores.to_csv('monthly_indicator_index_block.csv')
    df_district_scores = calc.calculate_type_index_block(df_district_scores)
    print("0000000000000")
    df_district_scores.to_csv('monthly_type_index_block.csv')
    df_district_scores = calc.calculate_domain_index_block(df_district_scores)
    print("0000000000000")
    df_district_scores.to_csv('monthly_domain_index_block.csv')
    df_district_scores = calc.calculate_compostite_score_block(
        df_district_scores)
    print("0000000000000")
    df_district_scores.to_csv('monthly_composite_score_block.csv')
    df_district_scores = calc.calculate_ranks(df_district_scores)
    df_district_scores.to_csv('monthly_ranks_block.csv')

    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3

    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['quarter'] = df_district_scores['date'].apply(
        add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)
    # df_district_scores.to_csv(
    #     'data/block_scores_new_oct.csv',
    #     index=False,
    #     encoding='utf-8')
    # print('done')
    # df_indicator_7_11 = calc.block_indicator_7_11_data(dates, block_map_ids)
    df_district_scores = calc.calculate_total_block_data(df_district_scores)
    # To csv
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_13') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_14') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    calc.write_df(df_district_scores, 'block_scores.csv')


def calculate_scores_block_quarter(date,year_dates):
    """Calculate final scores."""
    df_district_scores = pd.DataFrame()
    # dates_qa = config['quarter']
    current_date = datetime.strptime(date[0], "%Y%m")
    currQuarter = int((current_date.month - 1) / 3 + 1)
    dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)

    # print(dtFirstDay)

    q_frst = dtFirstDay.strftime("%Y%m")
    # print(q_frst)
    dates_qa =[]
    li = []
    d = int(date[0])
    qua = int(q_frst)
    while qua<=d:
        li.append(str(qua))
        qua+=1

    dates_qa.append(li)
    print(li)
    data = pd.read_csv(
        os.path.join(PATH,"data","subindicator_scores_blocks.csv"),
        encoding='utf-8')
    data.drop(data.loc[data['subindicator_id'].isin(['t03VPkJ5UXd.Ti9FJqkSK6J'])].index, inplace=True)
    flattened_date = [y for x in dates_qa for y in x]
    data = data.append(calc.get_nfhs_data(year_dates, flattened_date))
    for date in dates_qa:
        # gramex.config.app_log(date)
      print("-------------------", date)
      for indicator in indicator_name:
        df_district_scores = df_district_scores.append(calc1.indicator_qa_block(date,
            data, 'indicator_mappings_block', 'indicator_'+indicator))
        # if(indicator == 7):
        #     import pdb; pdb.set_trace()
        print (date, "done")
    indi_15 = pd.read_csv(
            os.path.join(PATH,"data","indicator_15_data.csv"),
            encoding='utf-8')
    indi_16 = pd.read_csv(
            os.path.join(PATH,"data","indicator_16_data.csv"),
            encoding='utf-8')
    fi_path = os.path.join(PATH,"xcxv.csv" )
    df_district_scores.to_csv(fi_path)
    # import pdb; pdb.set_trace()
    all_ = pd.DataFrame()
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    df_district_scores.dropna(inplace=True)
    df_district_scores.reset_index(inplace=True)
    df_district_scores.rename(index=str, columns={'district_id': 'block_id'}, inplace=True)
    del df_district_scores['index']
    for date in dates_qa:
        in_15 = indi_15[indi_15['date'].isin(date)].groupby([
            'block_id'])['perc_point'].mean().reset_index()
        in_15['date'] = date[-1]
        in_15['indicator_id'] = 'indicator_15'
        in_16 = indi_16[indi_16['date'].isin(date)].groupby([
            'block_id'])['perc_point'].mean().reset_index()
        in_16['date'] = date[-1]
        in_16['indicator_id'] = 'indicator_16'
        all_ = all_.append(in_16)
        all_ = all_.append(in_15)
    # del all_['index']
    df_district_scores = df_district_scores.append(all_)
    total_districts = organisation_unit[[
        'uid_district', 'district', 'uid_block', 'block']].drop_duplicates().reset_index()
    total_districts.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    del total_districts['index']
    organisation_unit_ = organisation_unit[['uid_block', 'facility']].groupby(
        ['uid_block']).size().reset_index()

    df_district_scores.reset_index(inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, total_districts, on='block_id')
    organisation_unit_.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, organisation_unit_, on='block_id')
    del df_district_scores['index']

    block_map_ids.rename(
        columns={
            'organisationunitid': 'block_id',
            'id_Shp_file': 'map_id'},
        inplace=True)

    df_district_scores = pd.merge(
        df_district_scores, block_map_ids[['block_id', 'map_id']],
        on='block_id')
    df_district_scores = pd.merge(
        df_district_scores,
        division_map_ids,
        on='district')
    df_district_scores = pd.merge(
        df_district_scores, indicators_df_block, on='indicator_id')
    df_district_scores['date'] = df_district_scores['date'].apply(str)
    # import pdb; pdb.set_trace()
    df_district_scores.to_csv('quarter_core_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    df_district_scores = calc.calculate_indicator_index_block(
        df_district_scores)
    df_district_scores.to_csv('quarter_calculate_indicator_index_block_df.csv')
    df_district_scores.drop_duplicates(inplace=True)


    df_district_scores = calc.calculate_type_index_block(df_district_scores)
    df_district_scores.to_csv('quarter_calculate_type_index_block_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print('first')


    df_district_scores = calc.calculate_domain_index_block(df_district_scores)
    df_district_scores.to_csv('quarter_domain_index_block_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print('second')

    df_district_scores = calc.calculate_compostite_score_block(df_district_scores)
    df_district_scores.to_csv('quarter_compostite_score_block_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print('seco')

    df_district_scores = calc.calculate_ranks(df_district_scores)
    df_district_scores.to_csv('quarter_calculate_ranks_block_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print("third")
    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3


    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['quarter'] = df_district_scores['date'].apply(
        add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)
    # import pdb; pdb.set_trace()
    del df_district_scores['date']
    df_district_scores['date'] = df_district_scores[['quarter', 'year']].apply(
        lambda x: pd.Period(freq='Q-JAN',
                            year=x.year, quarter=x.quarter).strftime('%Y-%m-01'), axis=1)
    # print("innn")
    # df_indicator_7_11 = calc.block_indicator_7_11_data(dates, block_map_ids)
    df_district_scores = calc.calculate_total_block_data(df_district_scores)
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_14') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_13') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    # To csv
    df_district_scores.drop_duplicates(inplace=True)
    calc.write_df(df_district_scores, 'block_scores_quarter.csv')


def calculate_scores_block_year(dates,year_dates):
    """Calculate final scores."""
    df_district_scores = pd.DataFrame()
    # dates_yr = config['year']

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
    print(dates_yr)
    data = pd.read_csv(
        os.path.join(PATH,"data","subindicator_scores_blocks.csv"),
        encoding='utf-8')
    data.drop(data.loc[data['subindicator_id'].isin(['t03VPkJ5UXd.Ti9FJqkSK6J'])].index, inplace=True)
    flattened_date = [y for x in dates_yr for y in x]
    data = data.append(calc.get_nfhs_data(year_dates, flattened_date))
    for date in dates_yr:
        # gramex.config.app_log(date)
      print("-------------------", date)
      for indicator in indicator_name:
        df_district_scores = df_district_scores.append(calc1.indicator_yr_block(date,
            data, 'indicator_mappings_block', 'indicator_'+indicator))
        print (date, "done")
    indi_15 = pd.read_csv(
            os.path.join(PATH,"data","indicator_15_data.csv"),
            encoding='utf-8')
    indi_16 = pd.read_csv(
            os.path.join(PATH,"data","indicator_16_data.csv"),
            encoding='utf-8')
    all_ = pd.DataFrame()
    # import pdb; pdb.set_trace()
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_11', 'indicator_13', 'indicator_14', 'indicator_8', 'indicator_9', 'indicator_12','indicator_4'])]
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    df_district_scores.dropna(inplace=True)
    df_district_scores.reset_index(inplace=True)
    df_district_scores.rename(index=str, columns={'district_id': 'block_id'}, inplace=True)
    del df_district_scores['index']
    for date in dates_yr:
        in_15 = indi_15[indi_15['date'].isin(date)].groupby([
            'block_id'])['perc_point'].mean().reset_index()
        in_15['date'] = date[-1]
        in_15['indicator_id'] = 'indicator_15'
        in_16 = indi_16[indi_16['date'].isin(date)].groupby([
            'block_id'])['perc_point'].mean().reset_index()
        in_16['date'] = date[-1]
        in_16['indicator_id'] = 'indicator_16'
        all_ = all_.append(in_16)
        all_ = all_.append(in_15)
    # del all_['index']
    df_district_scores = df_district_scores.append(all_)
    total_districts = organisation_unit[[
        'uid_district', 'district', 'uid_block', 'block']].drop_duplicates().reset_index()
    total_districts.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    del total_districts['index']
    organisation_unit_ = organisation_unit[['uid_block', 'facility']].groupby(
        ['uid_block']).size().reset_index()

    df_district_scores.reset_index(inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, total_districts, on='block_id')
    organisation_unit_.rename(
        index=str, columns={'uid_block': 'block_id'}, inplace=True)
    df_district_scores = pd.merge(
        df_district_scores, organisation_unit_, on='block_id')
    del df_district_scores['index']

    block_map_ids.rename(
        columns={
            'organisationunitid': 'block_id',
            'id_Shp_file': 'map_id'},
        inplace=True)

    df_district_scores = pd.merge(
        df_district_scores, block_map_ids[['block_id', 'map_id']],
        on='block_id')
    df_district_scores = pd.merge(
        df_district_scores,
        division_map_ids,
        on='district')
    df_district_scores = pd.merge(
        df_district_scores, indicators_df_block, on='indicator_id')
    df_district_scores['date'] = df_district_scores['date'].apply(str)
    # import pdb; pdb.set_trace()

    df_district_scores.to_csv('yearly_core_df.csv')
    df_district_scores.drop_duplicates(inplace=True)
    df_district_scores = calc.calculate_indicator_index_block(
        df_district_scores)
    df_district_scores.to_csv('yearly_calculate_indicator_index_block.csv')
    df_district_scores.drop_duplicates(inplace=True)


    df_district_scores = calc.calculate_type_index_block(df_district_scores)
    df_district_scores.to_csv('yearly_calculate_type_index_block.csv')
    df_district_scores.drop_duplicates(inplace=True)

    print("11111111")
    print('hjh')
    df_district_scores = calc.calculate_domain_index_block(df_district_scores)
    df_district_scores.to_csv('yearly_calculate_domain_index_block.csv')
    df_district_scores.drop_duplicates(inplace=True)

    print("11111111")
    print('huygh')
    # df_district_scores.to_csv('composite_score_block_year_dummy.csv')
    df_district_scores = calc.calculate_compostite_score_block(df_district_scores)
    df_district_scores.to_csv('yearly_compostite_score_block.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print('gjm')
    df_district_scores = calc.calculate_ranks(df_district_scores)
    df_district_scores.to_csv('yearly_calculate_ranks.csv')
    df_district_scores.drop_duplicates(inplace=True)
    print("11111111")
    print('jjhvhgxyh')
    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3


    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    # df_district_scores['quarter'] = df_district_scores['date'].apply(
    #     add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)
    # import pdb; pdb.set_trace()
    del df_district_scores['date']
    df_district_scores['date'] = df_district_scores['year'].apply(lambda x: '{}-04-01'.format(x-1))
    # print("innn")
    # df_indicator_7_11 = calc.block_indicator_7_11_data(dates, block_map_ids)
    df_district_scores = calc.calculate_total_block_data(df_district_scores)
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_14') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    df_district_scores['perc_point'] = np.where((df_district_scores['indicator_id'] == 'indicator_13') & (df_district_scores['perc_point'] >100), 100, df_district_scores['perc_point'])
    # To csv
    df_district_scores.to_csv('saving_in_block_scores_year.csv')
    df_district_scores.drop_duplicates(inplace=True)
    calc.write_df(df_district_scores, 'block_scores_year.csv')



def calculate_scores_quarter(date,year_dates,area='district'):
    print(area,"area_qa"*30)
    """Calculate final scores."""
    df_district_scores = pd.DataFrame()
    # dates = config['quarter']
    # date = '202307'

    # quater_list = ['04','07','10','01']


    current_date = datetime.strptime(date[0], "%Y%m")
    currQuarter = int((current_date.month - 1) / 3 + 1)
    dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)

    # print(dtFirstDay)

    q_frst = dtFirstDay.strftime("%Y%m")
    # print(q_frst)
    dates =[]
    li = []
    d = int(date[0])
    qua = int(q_frst)
    while qua<=d:
        li.append(str(qua))
        qua+=1

    dates.append(li)
    print(li)
    # import pdb; pdb.set_trace()
    if area == 'district':
        data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_districts.csv"),encoding='utf-8')
    else:
        data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_divisions.csv"),encoding='utf-8')
    # data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_districts.csv"),encoding='utf-8')
    for date in dates:
        # gramex.config.app_log(date)
        # import pdb; pdb.set_trace()
        df_district_scores = df_district_scores.append(
            calc.indicator_1_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_2_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_3_qa(date, data, 'indicator_31'))
        df_district_scores = df_district_scores.append(
            calc.indicator_3_qa(date, data, 'indicator_32'))
        df_district_scores = df_district_scores.append(
            calc.indicator_4_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_5_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_6_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_7_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_8_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_9_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_10_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_11_qa(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_12_qa(date, data))
        # print (date, "done")

    print('stop here')
    # import pdb;
    # pdb.set_trace();
    if area == 'district':
        indi_14 = pd.read_csv(os.path.join(PATH,"data","indicator_14_data.csv"), encoding='utf-8')
        indi_13 = pd.read_csv(os.path.join(PATH,"data","indicator_13_data.csv"), encoding='utf-8')
        all_ = pd.DataFrame()

        for date in dates:
            in_14 = indi_14[indi_14['date'].isin(date)].groupby(['district_id'])['perc_point'].mean().reset_index()
            in_14['date'] = date[-1]
            in_14['indicator_id'] = 'indicator_14'
            in_13 = indi_13[indi_13['date'].isin(date)].groupby(['district_id'])['perc_point'].mean().reset_index()
            in_13['date'] = date[-1]
            in_13['indicator_id'] = 'indicator_13'
            all_ = all_.append(in_13)
            all_ = all_.append(in_14)
    # del all_['index']
        df_district_scores = df_district_scores.append(all_)
        fil_path = os.path.join(PATH,"sadfg.csv")
        df_district_scores.to_csv(fil_path)

    if area== 'district':
        total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
    else:
        total_districts = organisation_unit[['uid_division', 'division']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_division': 'district_id', 'division':'district'}, inplace=True)

    # total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
    # total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
    del total_districts['index']

    df_district_scores.reset_index(inplace=True)
    df_district_scores = pd.merge(df_district_scores, total_districts, on='district_id')

    if area == 'district':
        df_district_scores = pd.merge(df_district_scores, district_map_ids[['district_id', 'map_id']], on='district_id')
        df_district_scores = pd.merge(df_district_scores, division_map_ids, on='district')

    df_district_scores = pd.merge(df_district_scores, indicators_df, on='indicator_id')

    df_district_scores['date'] = df_district_scores['date'].apply(str)

    df1 = pd.DataFrame()
    df2 = pd.DataFrame()
    df_all = pd.DataFrame()
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    # df_district_scores.loc[
    #     df_district_scores['perc_point'] > 100, 'perc_point'] = 100

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point']*0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point']*0.3

    file_path = os.path.join(PATH,'asd.csv')

    df_district_scores.to_csv(file_path, encoding='utf-8')
    df_district_scores = calc.calculate_indicator_index(df_district_scores)
    df_district_scores = calc.calculate_type_index(df_district_scores)
    df_district_scores = calc.calculate_domain_index(df_district_scores)
    df_district_scores = calc.calculate_compostite_score(df_district_scores)
    df_district_scores = calc.calculate_ranks(df_district_scores)

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point'] / 0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point'] / 0.3


    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3

    def add_financial_year(x):
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month > 3):
            return x.year + 1
        else:
            return x.year
    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['quarter'] = df_district_scores['date'].apply(
        add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)

    del df_district_scores['index']
    del df_district_scores['date']
    df_district_scores['date'] = df_district_scores[['quarter', 'year']].apply(
        lambda x: pd.Period(freq='Q-JAN',
                            year=x.year, quarter=x.quarter).strftime('%Y-%m-01'), axis=1)

    if(area == 'division'):
        # df_district_scores.rename(columns={'district_id': 'division_id', 'uid_district': 'district_id'},inplace=True)
        df_district_scores.rename(columns={'district_id': 'division_id', 'district':'division'},inplace=True)
        df_district_scores = pd.merge(df_district_scores, division_map_ids[['division', 'div_map_id']].drop_duplicates(), on='division')

    # To CSV
    if area == 'district':
        calc.write_df(df_district_scores, 'district_scores_quarter.csv')
    else:
        calc.write_df(df_district_scores, 'division_scores_quarter.csv')


def calculate_scores_year(date,year_dates,area = 'district'):
    print(area,"area_qa"*30)
    """Calculate final scores."""
    df_district_scores = pd.DataFrame()
    # dates = config['year']
    d= date[0]
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

    dates =[]
    y_list = []

    while (y_start <= p_date):
        if y_start%100 <=12 and y_start%100 != 0:
            y_list.append(y_start)
        y_start +=1


    dates.append(y_list)
    print(dates)
    if area == 'district':
        data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_districts.csv"),encoding='utf-8')
    else:
        data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_divisions.csv"),encoding='utf-8')

    for date in dates:
        # data = pd.read_csv(os.path.join(PATH,"data","subindicator_scores_districts.csv"), encoding='utf-8')
        df_district_scores = df_district_scores.append(
            calc.indicator_1_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_2_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_3_yr(date, data, 'indicator_31'))
        df_district_scores = df_district_scores.append(
            calc.indicator_3_yr(date, data, 'indicator_32'))
        df_district_scores = df_district_scores.append(
            calc.indicator_4_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_5_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_6_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_7_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_8_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_9_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_10_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_11_yr(date, data))
        df_district_scores = df_district_scores.append(
            calc.indicator_12_yr(date, data))
        print (date, "done")

    if area == 'district':
        indi_14 = pd.read_csv(os.path.join(PATH,"data","indicator_14_data.csv"), encoding='utf-8')
        indi_13 = pd.read_csv(os.path.join(PATH,"data","indicator_13_data.csv"), encoding='utf-8')
        all_ = pd.DataFrame()
        for date in dates:
            in_14 = indi_14[indi_14['date'].isin(date)].groupby(['district_id'])['perc_point'].mean().reset_index()
            in_14['date'] = date[-1]
            in_14['indicator_id'] = 'indicator_14'
            in_13 = indi_13[indi_13['date'].isin(date)].groupby(['district_id'])['perc_point'].mean().reset_index()
            in_13['date'] = date[-1]
            in_13['indicator_id'] = 'indicator_13'
            all_ = all_.append(in_13)
            all_ = all_.append(in_14)
        # del all_['index']
        df_district_scores = df_district_scores.append(all_)
        filepath = os.path.join(PATH, "hjkl.csv")
        df_district_scores.to_csv(filepath)

    if area== 'district':
        total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
    else:
        total_districts = organisation_unit[['uid_division', 'division']].drop_duplicates().reset_index()
        total_districts.rename(index=str, columns={'uid_division': 'district_id','division':'district'}, inplace=True)

    # total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
    # total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)

    del total_districts['index']
    df_district_scores.reset_index(inplace=True)
    df_district_scores = pd.merge(df_district_scores, total_districts, on='district_id')
    # import pdb;
    # pdb.set_trace();
    # df_district_scores = df_district_scores.append(calc.indicator_14(data))
    # df_district_scores = df_district_scores.append(calc.indicator_13())
    # del df_district_scores['index']
    if area == 'district':
        df_district_scores = pd.merge(df_district_scores, district_map_ids[['district_id', 'map_id']],on='district_id')
        df_district_scores = pd.merge(df_district_scores,division_map_ids,on='district')

    df_district_scores = pd.merge(df_district_scores, indicators_df, on='indicator_id')

    df_district_scores['date'] = df_district_scores['date'].apply(str)
    df1 = pd.DataFrame()
    df2 = pd.DataFrame()
    df_all = pd.DataFrame()
    df1 = df_district_scores[~df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df2 = df_district_scores[df_district_scores['indicator_id'].isin(['indicator_12', 'indicator_8', 'indicator_9','indicator_4'])]
    df1.loc[df1['perc_point'] > 100, 'perc_point'] = 100
    df_all = pd.concat([df1, df2])
    df_district_scores = df_all
    # df_district_scores.loc[
    #     df_district_scores['perc_point'] > 100, 'perc_point'] = 100

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point']*0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point']*0.3
    filep = os.path.join(PATH,'tttt.csv')
    df_district_scores.to_csv(filep, encoding='utf-8')
    df_district_scores = calc.calculate_indicator_index(df_district_scores)
    df_district_scores = calc.calculate_type_index(df_district_scores)
    df_district_scores = calc.calculate_domain_index(df_district_scores)
    df_district_scores = calc.calculate_compostite_score(df_district_scores)
    df_district_scores = calc.calculate_ranks(df_district_scores)

    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_31', 'perc_point'] = df_district_scores['perc_point'] / 0.7
    # df_district_scores.loc[df_district_scores.indicator_ids == 'indicator_32', 'perc_point'] = df_district_scores['perc_point'] / 0.3

    def add_quater(x):
        """Return quater to which that month belongs to."""
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3

    def add_financial_year(x):
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month > 3):
            return x.year + 1
        else:
            return x.year

    df_district_scores['date'] = df_district_scores[
        'date'].apply(lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['quarter'] = df_district_scores['date'].apply(
        add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(
            x,
            format='%Y%m').year +
        1 if pd.to_datetime(
            x,
            format='%Y%m').month > 3 else pd.to_datetime(
                x,
            format='%Y%m').year)

    # appending to prev_months data if calculating for one month only
    if config['one_month']:
        prev_data = gramex.cache.open(
            'district_scores.csv',
            'csv',
            rel=True,
            encoding='utf-8'
        )
        df_district_scores = df_district_scores.append(prev_data, ignore_index=True)
    del df_district_scores['index']
    del df_district_scores['date']
    del df_district_scores['quarter']
    df_district_scores['date'] = df_district_scores['year'].apply(lambda x: '{}-04-01'.format(x-1))

    if(area == 'division'):
        # df_district_scores.rename(columns={'district_id': 'division_id', 'uid_district': 'district_id'},inplace=True)
        df_district_scores.rename(columns={'district_id': 'division_id', 'district':'division'},inplace=True)
        df_district_scores = pd.merge(df_district_scores, division_map_ids[['division', 'div_map_id']].drop_duplicates(), on='division')

    # To CSV
    if area == 'district':
        calc.write_df(df_district_scores, 'district_scores_year.csv')
    else:
        calc.write_df(df_district_scores, 'division_scores_year.csv')


""" Data fetch operations"""

if len(sys.argv) > 1:
    operation = sys.argv[1]
if len(sys.argv) > 2:
    args = sys.argv[2]

# import pdb
# pdb.set_trace();
# Sub indicator scores (district/block)
# if operation == 'fetch':
#     if args == 'fetch_others':
#         calc.fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
#     elif args == 'fetch_blocks':
#         calc.fetch_block_data(fetching_dates, year_dates, sub_indicator_df_block, BASE_URL, block_ids)

# district indicator scores
# elif operation == 'cal1':
#     calculate_scores()
# elif operation == 'cal1_qa':
#     calculate_scores_quarter()
# elif operation == "cal1_yr":
#     calculate_scores_year()

# # block indicator scores
# elif operation == 'cal2':
#     calculate_scores_block()
# elif operation == "cal2_qa":
#     calculate_scores_block_quarter()
# elif operation == "cal2_yr":
#     calculate_scores_block_year()

# elif operation == 'cal3':
#     print("cal_div_month"*10)
#     calculate_scores('division')
# elif operation == 'cal3_qa':
#     calculate_scores_quarter('division')
# elif operation == "cal3_yr":
#     calculate_scores_year('division')


# def get_data():
#     calc.fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
#     calculate_scores()
#     calculate_scores_quarter()
#     calculate_scores_year()
#     block_15_16.run_api_script()
#     block_15_16.run_api_script_15()
#     calc.fetch_block_data(fetching_dates, year_dates, sub_indicator_df_block, BASE_URL, block_ids)
#     calculate_scores_block()
#     calculate_scores_block_year()
#     calculate_scores_block_quarter()



def calculate_phase1_scores(start_date,end_date,get_year_date):

    # start_date = '2022-10-01'
    # end_date = '2022-10-01'
    # start_date = str(start_date)
    # fetch_date = str(end_date)
    # end_date = str(end_date)
    # # breakpoint()
    # get_year_date = [str(get_year_date) + '04']
    d = end_date[0]
    print(int(d)%100)
    if (int(d)%100) == 1 or (int(d)%100) == 2 or (int(d)%100) == 3:
        g_year = (int(d)//100)-1
        print(g_year)
        # year = str(g_year) +'04'
        # print(year)
    else:
        g_year = int(d)//100
        print(g_year)
        # year = str(g_year) +'04'
        # print(year)

    # y_start = int(year)
    # # breakpoint()
    # if config['one_month']:
    #     dates = [pd.to_datetime(start_date, format='%Y-%m-%d').strftime('%Y%m')]
    # else:
    #     date_range = pd.date_range(
    #         start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    #     dates = [date for date in date_range.strftime('%Y%m')]
    #     # import pdb; pdb.set_trace()
    #     fetch_date_range = pd.date_range(
    #         start=fetch_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    #     fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]
    #     year_dates = [date[0:4] for date in year]
    d = str(end_date[0])
    dates = [d]
    year_dates = [str(g_year)]
    print(year_dates)
    # # breakpoint()
    calculate_scores(dates,year_dates)
    print("working 1 @@@@@@@@@@@@@@@@@")
    calculate_scores_quarter(dates,year_dates)
    print("working 2 @@@@@@@@@@@@@@@@@")
    calculate_scores_year(dates,year_dates)
    print("working 3 @@@@@@@@@@@@@@@@@")
    calculate_scores_block(dates,year_dates)
    print("working 4 @@@@@@@@@@@@@@@@@")
    calculate_scores_block_quarter(dates,year_dates)
    print("working 5 @@@@@@@@@@@@@@@@@")
    calculate_scores_block_year(dates,year_dates)
    print("working 6 @@@@@@@@@@@@@@@@@")
    # pass

# calculate_phase1_scores()
