"""Main etl file."""
import logging
import calculations_cm as calc
# import block_level_qa_yr as calc1
import gramex.cache
import pandas as pd
import urllib3
import sys
import os.path
from datetime import datetime
from dateutil.relativedelta import relativedelta
PATH = os.path.dirname(__file__)
# Logs
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info('message')

# Read config_cm.yaml
config = gramex.cache.open('config_cm.yaml', 'yaml', rel=True)

# Dates


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
#     ['uid_district', 'district', 'uid_block', 'block', 'division']]


# for fetching
# organisation_unit = gramex.cache.open(
#     os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
#     'xlsx',
#     rel=True,
#     encoding='utf-8'
# )[['district_uid', 'district', 'block_uid', 'block', 'facility']]
# organisation_unit.rename(columns = {'district_uid': 'uid_district', 'block_uid': 'uid_block'}, inplace=True)


# for calcualtions
organisation_unit = gramex.cache.open(
    os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"),
    'xlsx',
    rel=True,
    encoding='utf-8'
)[['district_uid', 'district', 'division_uid', 'division', 'updated_block_uid', 'updated_block_name', 'facility']]
organisation_unit.rename(columns = {'district_uid': 'uid_district', 'division_uid': 'uid_division', 'updated_block_uid': 'uid_block', 'updated_block_name': 'block'}, inplace=True)

# Fetch unique districts and blocks
district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())

# fetch district - id mapping
#  district_id   district
#  N5WWbRtsjWp       Agra
#  eJTsuE56XDF  Firozabad
total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
del total_districts['index']

# fetch block-div-id mapping
total_blocks = organisation_unit[['uid_district', 'district',
                                  'uid_block', 'block']].drop_duplicates().reset_index()
total_blocks.rename(index=str, columns={'uid_block': 'block_id',
                                        'uid_district': 'district_id'}, inplace=True)
del total_blocks['index']

# config variables
BASE_URL = config['api']['base_url']

""" Calculate district/block monthly scores."""


def calculate_scores(dates,year_dates,area='district'):

    if area == 'district':
        sheet_name = 'data_cm/subindicator_scores_districts_cm.csv'
        map = 'indicator_mappings'
        output_sheet = 'data_cm/district_cm_scores.csv'

    elif area == 'block':
        sheet_name = 'data_cm/subindicator_scores_blocks_cm.csv'
        map = 'indicator_mappings_block'
        output_sheet = 'data_cm/block_cm_scores.csv'

    fpath = os.path.join(PATH, sheet_name)
    data = pd.read_csv(fpath, encoding='utf-8')

    df_district_scores = pd.DataFrame()

    for date in dates:
        df_district_scores = df_district_scores.append(
            calc.indicator_month(date, data, map))

    df_district_scores.reset_index(inplace=True)

    # import pdb; pdb.set_trace()

    # Add additional relevant columns
    if area == 'block':
        df_district_scores.rename(index=str, columns={'district_id': 'block_id'}, inplace=True)
        df_district_scores = pd.merge(df_district_scores, total_blocks, on='block_id')
        df_district_scores = pd.merge(df_district_scores, indicators_df_block, on='indicator_id')
    elif area == 'district':
        df_district_scores = pd.merge(df_district_scores, total_districts, on='district_id')
        df_district_scores = pd.merge(df_district_scores, indicators_df, on='indicator_id')

        df_district_scores = pd.merge(df_district_scores, district_map_ids[[
            'district_id', 'map_id']], on='district_id')
        df_district_scores = pd.merge(df_district_scores, division_map_ids, on='district')

    # Round perc_point if > 100
    df_district_scores.loc[df_district_scores['perc_point'] > 100, 'perc_point'] = 100
    df_district_scores.drop(['indicator_ids'], axis=1, inplace=True)

    # Add quarter/year/month columns
    df_district_scores['date'] = df_district_scores['date'].apply(str)
    df_district_scores['date'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(x, format='%Y%m'))
    df_district_scores['quarter'] = df_district_scores['date'].apply(calc.add_quater)
    df_district_scores['year'] = df_district_scores['date'].apply(lambda x: pd.to_datetime(
        x, format='%Y%m').year + 1 if pd.to_datetime(x, format='%Y%m').month > 3 else pd.to_datetime(x, format='%Y%m').year)

    # To csv
    # df_district_scores.to_csv(output_sheet, index=False, encoding='utf-8')
    calc.write_df(df_district_scores, output_sheet)


""" Calculate district/block - yearly/quarterly scores."""


def calculate_scores_2(date,year_dates,area='district', period='year'):

    if area == 'district':
        sheet_name = 'data_cm/subindicator_scores_districts_cm.csv'
        map = 'indicator_mappings'
        output_sheet = 'data_cm/district_cm_scores_'+period+'.csv'
        indicator_idss = config['indicator_district_id']
        sub_period_df = sub_indicator_df

    elif area == 'block':
        sheet_name = 'data_cm/subindicator_scores_blocks_cm.csv'
        map = 'indicator_mappings_block'
        output_sheet = 'data_cm/block_cm_scores_'+period+'.csv'
        indicator_idss = config['indicator_block_id']
        sub_period_df = sub_indicator_df_block

    if period == 'year':
        # [["201904", "201905", "201906", "201907", "201908", "201909"]]
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

    elif period == 'quarter':
        #[["201907", "201908", "201909"]]
        # dates = config['quarter']
        current_date = datetime.strptime(str(date[0]), "%Y%m")
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

    fpath = os.path.join(PATH, sheet_name)
    data = pd.read_csv(fpath, encoding='utf-8')

    df_district_scores = pd.DataFrame()

    # for every indicator, fetch perc point
    for date in dates:
        for _id in indicator_idss:
            df_district_scores = df_district_scores.append(
                calc.indicator_yr(date, data, map, 'indicator_'+_id, sub_period_df))

    df_district_scores.dropna(inplace=True)
    df_district_scores.reset_index(inplace=True)

    # Add additional relevant columns
    if area == 'block':
        df_district_scores.rename(index=str, columns={'district_id': 'block_id'}, inplace=True)
        df_district_scores = pd.merge(df_district_scores, total_blocks, on='block_id')
        df_district_scores = pd.merge(df_district_scores, indicators_df_block, on='indicator_id')
    elif area == 'district':
        df_district_scores = pd.merge(df_district_scores, total_districts, on='district_id')
        df_district_scores = pd.merge(df_district_scores, indicators_df, on='indicator_id')

        df_district_scores = pd.merge(df_district_scores, district_map_ids[[
            'district_id', 'map_id']], on='district_id')
        df_district_scores = pd.merge(df_district_scores, division_map_ids, on='district')

    # Round perc_point if > 100
    df_district_scores.loc[df_district_scores['perc_point'] > 100, 'perc_point'] = 100
    df_district_scores.drop(['indicator_ids'], axis=1, inplace=True)

    # Add quarter/year/month columns
    df_district_scores['date'] = df_district_scores['date'].apply(str)   # 201909
    df_district_scores['date'] = df_district_scores['date'].apply(
        lambda x: pd.to_datetime(x, format='%Y%m'))

    df_district_scores['year'] = df_district_scores['date'].apply(lambda x: pd.to_datetime(
        x, format='%Y%m').year + 1 if pd.to_datetime(x, format='%Y%m').month > 3 else pd.to_datetime(x, format='%Y%m').year)

    if period == 'year':
        del df_district_scores['date']
        df_district_scores['date'] = df_district_scores['year'].apply(
            lambda x: '{}-04-01'.format(x-1))

    elif period == 'quarter':
        df_district_scores['quarter'] = df_district_scores['date'].apply(calc.add_quater)
        del df_district_scores['date']
        df_district_scores['date'] = df_district_scores[['quarter', 'year']].apply(
            lambda x: pd.Period(freq='Q-JAN', year=x.year, quarter=x.quarter).strftime('%Y-%m-01'), axis=1)

    # To csv
    df_district_scores.drop(['index'], axis=1, inplace=True)
    # df_district_scores.to_csv(output_sheet, index=False, encoding='utf-8')
    calc.write_df(df_district_scores, output_sheet)


"""
Commands
python cm_etl.py fetch fetch_districts - Fetch district sub indicators
"""
if len(sys.argv) > 1:
    operation = sys.argv[1]
if len(sys.argv) > 2:
    args = sys.argv[2]

# District/Block subindicator fetch
# if operation == 'fetch':
#     if args == 'fetch_districts':
#         calc.fetch_district_data(fetching_dates, year_dates, BASE_URL, district_ids)
#         print('*********Success: District Subindicator')

#     elif args == 'fetch_blocks':
#         calc.fetch_district_data(fetching_dates, year_dates, BASE_URL, block_ids, 'block')
#         print('*******Success: Block Subindicator')

# District calculate
# elif operation == 'cal':
#     calculate_scores()
#     print('*******Success: District score: Month')

# elif operation == 'cal_qa':
#     calculate_scores_2('district', 'quarter')
#     print('*******Success: District score: Quarter')

# elif operation == "cal_yr":
#     calculate_scores_2('district', 'year')
#     print('*******Success: District score: Year')

# # Blocks calculate
# elif operation == 'cal_block':
#     calculate_scores('block')
#     print('*******Success: Block score: Month')

# elif operation == "cal_qa_block":
#     calculate_scores_2('block', 'quarter')
#     print('*******Success: Block score: Quarter')

# elif operation == "cal_yr_block":
#     calculate_scores_2('block', 'year')
#     print('*******Success: Block score: Year')

def calculate_score_cm(start_date,end_date,get_year_date):

    # end_date = config['end_date']
    # fetch_date = start_date
    # get_year_date = [get_year_date +'04']
    # # get_year_date = [date[0] for date in config['year']]  # ['201904']

    # # Get date ranges
    # date_range = pd.date_range(
    #     start=start_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    # dates = [date for date in date_range.strftime('%Y%m')]  # ['201909']

    # fetch_date_range = pd.date_range(
    #     start=fetch_date, end=end_date, freq=pd.offsets.MonthBegin(1))
    # fetching_dates = [date for date in fetch_date_range.strftime('%Y%m')]  # ['201909']

    # year_dates = [date[0:4] for date in get_year_date]  # ['2019']
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
    dates = end_date
    year_dates = [str(g_year)]
    print(year_dates)

    calculate_scores(dates,year_dates)
    calculate_scores_2(dates,year_dates,'district', 'quarter')
    calculate_scores_2(dates,year_dates,'district', 'year')
    print('*******Success: District score: Year')
    calculate_scores(dates,year_dates,'block')
    print('*******Success: Block score: Month')
    calculate_scores_2(dates,year_dates,'block', 'quarter')
    print('*******Success: Block score: Quarter')
    calculate_scores_2(dates,year_dates,'block', 'year')
    print('*******Success: Block score: Year')


# calculate_score_cm()
