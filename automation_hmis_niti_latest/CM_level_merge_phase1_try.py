# Phase 1 - df1
# CM - df, df2

import pandas as pd
from datetime import datetime
import os.path
PATH = os.path.dirname(__file__)
# month_date = ['2022-09-01']
# quarter_date = ['2022-07-01']
# year_date = ['2022-04-01']

def district_month_merge(month_date):

    # district - month
    df = pd.read_csv(os.path.join(PATH, "data_cm", "district_cm_scores.csv"))
    # # Phase 1 data
    df1 = pd.read_csv(os.path.join(PATH, "data", "district_scores.csv"))

    # district - quarter
    # df = pd.read_csv('district_cm_scores_quarter.csv')
    # df1 = pd.read_csv('district_scores_quarter.csv')

    # district - year
    # df = pd.read_csv('district_cm_scores_year.csv')
    # df1 = pd.read_csv('district_scores_year.csv')

    # block - month
    # df = pd.read_csv('block_cm_scores.csv')
    # df1 = pd.read_csv('block_scores.csv')

    # block - quarter
    # df = pd.read_csv('block_cm_scores_quarter.csv')
    # df1 = pd.read_csv('block_scores_quarter.csv')

    # block - year
    # df = pd.read_csv('block_cm_scores_year.csv')
    # df1 = pd.read_csv('block_scores_year.csv')

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    df2 = df.drop(df.loc[df['date'].isin(month_date) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    df1 = df1[df1['date'].isin(month_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(month_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    filepath = os.path.join(PATH, "data_cm", "district_cm_scores.csv")
    df2.to_csv(filepath, index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


    print('done')



def district_quarter_merge(quarter_date):
    # district - month
    # df = pd.read_csv('district_cm_scores.csv')
    # # Phase 1 data
    # df1 = pd.read_csv('district_scores.csv')

    # district - quarter
    df = pd.read_csv(os.path.join(PATH, "data_cm", "district_cm_scores_quarter.csv"))
    df1 = pd.read_csv(os.path.join(PATH, "data", "district_scores_quarter.csv"))

    # district - year
    # df = pd.read_csv('district_cm_scores_year.csv')
    # df1 = pd.read_csv('district_scores_year.csv')

    # block - month
    # df = pd.read_csv('block_cm_scores.csv')
    # df1 = pd.read_csv('block_scores.csv')

    # block - quarter
    # df = pd.read_csv('block_cm_scores_quarter.csv')
    # df1 = pd.read_csv('block_scores_quarter.csv')

    # block - year
    # df = pd.read_csv('block_cm_scores_year.csv')
    # df1 = pd.read_csv('block_scores_year.csv')

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    df2 = df.drop(df.loc[df['date'].isin(quarter_date) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    df1 = df1[df1['date'].isin(quarter_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(quarter_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')

    df2.to_csv(os.path.join(PATH, "data_cm", "district_cm_scores_quarter.csv"), index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


    print('done')


def district_year_merge(year_date):
    # district - month
    # df = pd.read_csv('district_cm_scores.csv')
    # # Phase 1 data
    # df1 = pd.read_csv('district_scores.csv')

    # district - quarter
    # df = pd.read_csv('district_cm_scores_quarter.csv')
    # df1 = pd.read_csv('district_scores_quarter.csv')

    # district - year
    df = pd.read_csv(os.path.join(PATH, "data_cm", "district_cm_scores_year.csv"))
    df1 = pd.read_csv(os.path.join(PATH, "data", "district_scores_year.csv"))

    # block - month
    # df = pd.read_csv('block_cm_scores.csv')
    # df1 = pd.read_csv('block_scores.csv')

    # block - quarter
    # df = pd.read_csv('block_cm_scores_quarter.csv')
    # df1 = pd.read_csv('block_scores_quarter.csv')

    # block - year
    # df = pd.read_csv('block_cm_scores_year.csv')
    # df1 = pd.read_csv('block_scores_year.csv')

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    df2 = df.drop(df.loc[df['date'].isin(year_date) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    df1 = df1[df1['date'].isin(year_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(year_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
    df2.to_csv(os.path.join(PATH, "data_cm", "district_cm_scores_year.csv"), index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


    print('done')


def block_month_merge(month_date):
    # district - month
    # df = pd.read_csv('district_cm_scores.csv')
    # # Phase 1 data
    # df1 = pd.read_csv('district_scores.csv')

    # district - quarter
    # df = pd.read_csv('district_cm_scores_quarter.csv')
    # df1 = pd.read_csv('district_scores_quarter.csv')

    # district - year
    # df = pd.read_csv('district_cm_scores_year.csv')
    # df1 = pd.read_csv('district_scores_year.csv')

    # block - month
    df = pd.read_csv(os.path.join(PATH, "data_cm", "block_cm_scores.csv"))
    df1 = pd.read_csv(os.path.join(PATH, "data", "block_scores.csv"))

    # block - quarter
    # df = pd.read_csv('block_cm_scores_quarter.csv')
    # df1 = pd.read_csv('block_scores_quarter.csv')

    # block - year
    # df = pd.read_csv('block_cm_scores_year.csv')
    # df1 = pd.read_csv('block_scores_year.csv')

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    df2 = df.drop(df.loc[df['date'].isin(month_date) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    df1 = df1[df1['date'].isin(month_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(month_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

    df2.to_csv(os.path.join(PATH, "data_cm", "lock_cm_scores.csv"), index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


    print('done')


def block_quarter_merge(quarter_date):
    # district - month
    # df = pd.read_csv('district_cm_scores.csv')
    # # Phase 1 data
    # df1 = pd.read_csv('district_scores.csv')

    # district - quarter
    # df = pd.read_csv('district_cm_scores_quarter.csv')
    # df1 = pd.read_csv('district_scores_quarter.csv')

    # district - year
    # df = pd.read_csv('district_cm_scores_year.csv')
    # df1 = pd.read_csv('district_scores_year.csv')

    # block - month
    # df = pd.read_csv('block_cm_scores.csv')
    # df1 = pd.read_csv('block_scores.csv')

    # block - quarter
    df = pd.read_csv(os.path.join(PATH, "data_cm", "block_cm_scores_quarter.csv"))
    df1 = pd.read_csv(os.path.join(PATH, "data", "block_scores_quarter.csv"))

    # block - year
    # df = pd.read_csv('block_cm_scores_year.csv')
    # df1 = pd.read_csv('block_scores_year.csv')

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    df2 = df.drop(df.loc[df['date'].isin(quarter_date) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    df1 = df1[df1['date'].isin(quarter_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(quarter_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
    df2.to_csv(os.path.join(PATH, "data_cm", "lock_cm_scores_quarter.csv"), index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


    print('done')


def block_year_merge(year_date):
    # district - month
    # df = pd.read_csv('district_cm_scores.csv')
    # # Phase 1 data
    # df1 = pd.read_csv('district_scores.csv')

    # district - quarter
    # df = pd.read_csv('district_cm_scores_quarter.csv')
    # df1 = pd.read_csv('district_scores_quarter.csv')

    # district - year
    # df = pd.read_csv('district_cm_scores_year.csv')
    # df1 = pd.read_csv('district_scores_year.csv')

    # block - month
    # df = pd.read_csv('block_cm_scores.csv')
    # df1 = pd.read_csv('block_scores.csv')

    # block - quarter
    # df = pd.read_csv('block_cm_scores_quarter.csv')
    # df1 = pd.read_csv('block_scores_quarter.csv')

    # block - year
    df = pd.read_csv(os.path.join(PATH, "data_cm", "block_cm_scores_year.csv"))
    df1 = pd.read_csv(os.path.join(PATH, "data", "block_scores_year.csv"))

    print('done')


    #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
    # 2,7,10 - district level indicators
    # 2,7 are block level indicators

    # district
    # month
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # quarter (jul 1 is the start of quarter)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
    # year (apr 1 is the start of year)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

    #block
    # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    df2 = df.drop(df.loc[df['date'].isin(year_date) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
    print('done')


    # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
    # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

    # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    df1 = df1[df1['date'].isin(year_date) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
    print('done')


    # Cross verification checks in CM df before data fetch
    print(df2['date'].unique())
    print(df2[df2['date'].isin(year_date)]['indicator_id'].unique())

    # CM columns from CM df
    cols = df2.columns
    # print(df2.columns)
    print(cols)
    print('done')


    # Getting only the relevant columns from phase 1 sheet to CM
    # For quarter/year/month/block/district - the columns vary, so change accordingly
    # df1['date'].unique()
    # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
    #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
    #        'perc_point', 'quarter', 'type', 'year']]
    df1 = df1[cols]
    df1.columns
    print('done')


    # append rows from phase 1 to cm sheet
    df1 = df1.drop_duplicates() # drops duplicates
    df2 = df2.append(df1, ignore_index =True,sort = True)
    print('done')


    # export to csv
    # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

    # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
    # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
    df2.to_csv(os.path.join(PATH, "data_cm", "lock_cm_scores_year.csv"), index = False, encoding='utf-8')


    print('done')


def cm_phase1_ind_merge(prev_date,cur_date,year_date):
    current_date = datetime.strptime(str(cur_date), "%Y%m")
    currQuarter = int((current_date.month - 1) / 3 + 1)
    dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)
    # quater_date = datetime.strptime(str(dtFirstDay), "%Y-%m-%d")
    q_frst = dtFirstDay.strftime("%Y-%m-%d")
    quat_date = [q_frst]

    year_start = str(year_date) + '-04' + '-01'

    month_date = datetime.strptime(str(cur_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")

    # print(dtFirstDay)
    # d= current_date
    # print(int(d)%100)
    # if (int(d)%100) == 1 or (int(d)%100) == 2 or (int(d)%100) == 3:
    #     g_year = (int(d)//100)-1
    #     print(g_year)

    #     year = str(g_year) +'04'

    #     print(year)
    # else:
    #     g_year = int(d)//100
    #     print(g_year)

    #     year = str(g_year) +'04'

    #     print(year)

    # y_start = int(year)
    # year_start = datetime.strptime(str(y_start), "%Y-%m-%d")

    # q_frst = dtFirstDay.strftime("%Y%m")
    # # print(q_frst)
    # dates_qa =[]
    # li = []
    # d = int(current_date)
    # qua = int(q_frst)
    # while qua<=d:
    #     li.append(str(qua))
    #     qua+=1

    # dates_qa.append(li)
    # print(li)
    district_month_merge([m_date])
    district_quarter_merge(quat_date)
    district_year_merge([year_start])
    block_month_merge([m_date])
    block_quarter_merge(quat_date)
    block_year_merge([year_start])



##################################################### IIIIGGGGNNNOOORRREEEEEEE ###############################################################

# # CM data

# # district - month
# # df = pd.read_csv('district_cm_scores.csv')
# # # Phase 1 data
# # df1 = pd.read_csv('district_scores.csv')

# # district - quarter
# # df = pd.read_csv('district_cm_scores_quarter.csv')
# # df1 = pd.read_csv('district_scores_quarter.csv')

# # district - year
# # df = pd.read_csv('district_cm_scores_year.csv')
# # df1 = pd.read_csv('district_scores_year.csv')

# # block - month
# # df = pd.read_csv('block_cm_scores.csv')
# # df1 = pd.read_csv('block_scores.csv')

# # block - quarter
# # df = pd.read_csv('block_cm_scores_quarter.csv')
# # df1 = pd.read_csv('block_scores_quarter.csv')

# # block - year
# df = pd.read_csv('block_cm_scores_year.csv')
# df1 = pd.read_csv('block_scores_year.csv')

# print('done')


# #In cm df - remove Nov month data for indicator ids (2,7,10) if already exists
# # 2,7,10 - district level indicators
# # 2,7 are block level indicators

# # district
# # month
# # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
# # quarter (jul 1 is the start of quarter)
# # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)
# # year (apr 1 is the start of year)
# # df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_10', 'indicator_7'])].index)

# #block
# # df2 = df.drop(df.loc[df['date'].isin(['2022-09-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
# # df2 = df.drop(df.loc[df['date'].isin(['2022-07-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
# df2 = df.drop(df.loc[df['date'].isin(['2022-04-01']) & df['indicator_id'].isin(['indicator_2', 'indicator_7'])].index)
# print('done')


# # from phase 1 sheet (district_score.csv) -  fetch Nov month data for indicator ids (2,7,10)
# # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]
# # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10' ])]
# # df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7', 'indicator_10'])]

# # df1 = df1[df1['date'].isin(['2022-09-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
# # df1 = df1[df1['date'].isin(['2022-07-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
# df1 = df1[df1['date'].isin(['2022-04-01']) & df1['indicator_id'].isin(['indicator_2', 'indicator_7'])]
# print('done')


# # Cross verification checks in CM df before data fetch
# print(df2['date'].unique())
# print(df2[df2['date'].isin(['2022-07-01'])]['indicator_id'].unique())

# # CM columns from CM df
# cols = df2.columns
# # print(df2.columns)
# print(cols)
# print('done')


# # Getting only the relevant columns from phase 1 sheet to CM
# # For quarter/year/month/block/district - the columns vary, so change accordingly
# # df1['date'].unique()
# # df1 = df1[['calc_type', 'date', 'district', 'district_id', 'div_map_id',
# #        'division', 'domain', 'indicator', 'indicator_id', 'map_id',
# #        'perc_point', 'quarter', 'type', 'year']]
# df1 = df1[cols]
# df1.columns
# print('done')


# # append rows from phase 1 to cm sheet
# df1 = df1.drop_duplicates() # drops duplicates
# df2 = df2.append(df1, ignore_index =True,sort = True)
# print('done')


# # export to csv
# # df2.to_csv("data_cm\district_cm_scores.csv", index = False, encoding='utf-8')
# # df2.to_csv("data_cm\district_cm_scores_quarter.csv", index = False, encoding='utf-8')
# # df2.to_csv("data_cm\district_cm_scores_year.csv", index = False, encoding='utf-8')

# # df2.to_csv("data_cm\lock_cm_scores.csv", index = False, encoding='utf-8')
# # df2.to_csv("data_cm\lock_cm_scores_quarter.csv", index = False, encoding='utf-8')
# df2.to_csv("data_cm\lock_cm_scores_year.csv", index = False, encoding='utf-8')


# print('done')
