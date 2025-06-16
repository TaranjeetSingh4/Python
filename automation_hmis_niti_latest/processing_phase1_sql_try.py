import pandas as pd
import numpy as np
import os.path
import sqlalchemy
from sqlalchemy import MetaData, inspect
import pymysql
from datetime import datetime
from gramex import variables
PATH = os.path.dirname(__file__)

staging_db_connection = variables['staging_db_connection']
# mapping  = pd.read_csv('ou_id_mappings.csv')
mapping_updated = pd.read_excel(os.path.join(PATH, 'ou_id_mappings_updated.xlsx'))

print(mapping_updated.columns)

# # blocks = list(set(mapping['uid_block']))
# # districts = list(set(mapping['uid_district']))
# # divisions = list(set(mapping['uid_division']))

# blocks = list(set(mapping['block_uid']))
# districts = list(set(mapping['district_uid']))
# divisions = list(set(mapping['division_uid']))

# print(len(blocks))

# blocks_ids = {}
# districts_ids = {}
# divisions_ids = {}
# for i in range(len(blocks)):
#     blocks_ids[blocks[i]] = i+1
# for j in range(len(districts)):
#     districts_ids[districts[j]] = j+1
# for k in range(len(divisions)):
#     divisions_ids[divisions[k]] = k+1

# mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
mapping_dicts=pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))

print(mapping_dicts.columns)

# month_date = ['2022-03-01']
# quarter_date =['2022-01-01']
# year_date = '2021-04-01'
# f_year = 2022



def monthly_blockdata_upload(month_date):
    #################### MAPPING block_id_num in block data ##############################

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))

    #monthly

    _date = month_date
    fpathloc = os.path.join(PATH,"data","block_scores.csv")
    blocks_data = pd.read_csv(fpathloc)

    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    f_path = os.path.join(PATH,'db_push','data','block_scores.csv')

    blocks_data.to_csv(f_path,index=False)
    # blocks_data.to_csv('db_push/data/block_scores_quarter.csv',index=False)
    # blocks_data.to_csv('db_push/data/block_scores_year.csv',index=False)
    print('done')
    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')

    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())


    ####### inserting data into fact tables #############

    ## block data monthly: inserting data into fact_phase1_block_data_monthly table
    fpath_loc1 = os.path.join(PATH,"db_push","data","block_scores.csv")
    data = pd.read_csv(fpath_loc1)

    print(data.columns)
    print(data['date'].unique())

    # data = data.query('date=="2020-05-01"')
    # data.info()
    print(len(data['date'].unique()))
    print("unique dates", data['date'].unique())
    print("len of unique dates",len(data['date'].unique()))
    print("len of data",len(data))

    print(len(data))

    data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
                'indicator_rank','type_index','type_rank','perc_point','count','date']]

    # print(data[data.duplicated()])
    #---my code
    data.drop_duplicates(inplace=True)
    # data.drop_duplicates(['block_id_num','indicator_id','date'], inplace=True)
    #my code ends
    print(data[data.duplicated()])
    data = data.astype(object).where(pd.notnull(data),None)
    lis=[]

    with engine.connect() as con:
        k = con.execute('SELECT distinct(date) FROM fact_phase1_block_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_phase1_block_data_monthly where date=(%s)',(month_date[0]))

    print(lis)

    data.to_sql('fact_phase1_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def quarterly_blockdata_upload(quarter_date):
    #################### MAPPING block_id_num in block data ##############################

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database
    # quaterly
    _date = quarter_date
    fpath_loc1 = os.path.join(PATH,"data","block_scores_quarter.csv")
    blocks_data = pd.read_csv(fpath_loc1)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # blocks_data.to_csv('db_push/data/block_scores.csv',index=False)
    fi_path = os.path.join(PATH,'db_push','data','block_scores_quarter.csv')
    blocks_data.to_csv(fi_path,index=False)
    # blocks_data.to_csv('db_push/data/block_scores_year.csv',index=False)
    print('done')

    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## block data quarterly: inserting data into fact_phase1_block_data_quaterly table

    fpath_loc = os.path.join(PATH,"db_push","data","block_scores_quarter.csv")
    data = pd.read_csv(fpath_loc)
    print(data.columns)

    print(data['date'].unique())

    with engine.connect() as con:
        con.execute('DELETE from fact_phase1_block_data_quaterly where date=(%s)',(quarter_date[0]))

    print(len(data))

    data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
                'indicator_rank','type_index','type_rank','perc_point','count','date','quarter','year']]

    data.drop_duplicates(['block_id_num','indicator_id','date'], inplace=True)

    print(data[data.duplicated()])
    print(len(data))
    data.to_sql('fact_phase1_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def yearly_blockdata_upload(year_date,year):
    year = int(year) + 1
    #################### MAPPING block_id_num in block data ##############################


    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # mothly

    # # _date = ['2022-03-01']
    # blocks_data = pd.read_csv('data/block_scores.csv')

    # # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    # _date = ['2022-01-01']
    # blocks_data = pd.read_csv('data/block_scores_quarter.csv')

    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # yearly
    _date = year_date
    fllpath = os.path.join(PATH,"data","block_scores_year.csv")
    blocks_data = pd.read_csv(fllpath)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # blocks_data.to_csv('db_push/data/block_scores.csv',index=False)
    # blocks_data.to_csv('db_push/data/block_scores_quarter.csv',index=False)
    fil_path = os.path.join(PATH,'db_push','data','block_scores_year.csv')
    blocks_data.to_csv(fil_path,index=False)
    print('done')
    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())


    ## block data yearly: inserting data into fact_phase1_block_data_yearly table
    flpath = os.path.join(PATH,"db_push","data","block_scores_year.csv")
    data = pd.read_csv(flpath)

    print(data.columns)

    print(data['year'].unique())

    data['year'] = data['year'].astype(np.int64)

    print(len(data))

    with engine.connect() as con:
        con.execute('DELETE from fact_phase1_block_data_yearly where year=(%s)',year)

    data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
                'indicator_rank','type_index','type_rank','perc_point','count','date','year']]

    print(len(data))

    print(data[data.duplicated()])

    data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','composite_index','year','date'])

    data.to_sql('fact_phase1_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')

def monthly_districtdata_upload(month_date):
    #################### MAPPING district_id_num in district data ##############################
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly

    _date = month_date
    fl_path1 = os.path.join(PATH,"data","district_scores.csv")
    districts_data = pd.read_csv(fl_path1)

    districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly

    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_scores_quarter.csv')

    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = '2021-04-01'
    # districts_data = pd.read_csv('data/district_scores_year.csv')
    # districts_data = districts_data[districts_data['date'] == _date]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    fpath = os.path.join(PATH,'db_push','data','district_scores.csv')

    districts_data.to_csv(fpath,index=False)
    # districts_data.to_csv('db_push/data/district_scores_quarter.csv',index=False)
    # districts_data.to_csv('db_push/data/district_scores_year.csv',index=False)
    print('done')
    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## district data monthly: inserting data into fact_phase1_district_data_monthly table
    fl_path = os.path.join(PATH,"db_push","data","district_scores.csv")
    data = pd.read_csv(fl_path)

    print(data.columns)

    print(data['date'].unique())

    print(len(data))

    print(data[data.duplicated()])

    data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
                'indicator_index','indicator_rank','type_index','type_rank','date']]

    data = data.drop_duplicates(subset = ['district_id_num','indicator_id', 'perc_point'], keep='first')

    lis=[]

    with engine.connect() as con:
        k = con.execute('SELECT distinct(date) FROM fact_phase1_district_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_phase1_district_data_monthly where date=(%s)',(month_date[0]))

    print(lis)

    print(len(data))
    print(data.head(50))
    data.to_sql('fact_phase1_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def quarterly_districtdata_upload(quarter_date):

    #################### MAPPING district_id_num in district data ##############################
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly

    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_scores.csv')

    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly

    _date = quarter_date
    f_path1 = os.path.join(PATH,"data","district_scores_quarter.csv")
    districts_data = pd.read_csv(f_path1)

    districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = '2021-04-01'
    # districts_data = pd.read_csv('data/district_scores_year.csv')
    # districts_data = districts_data[districts_data['date'] == _date]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('db_push/data/district_scores.csv',index=False)
    fipath = os.path.join(PATH,'db_push','data','district_scores_quarter.csv')
    districts_data.to_csv(fipath,index=False)
    # districts_data.to_csv('db_push/data/district_scores_year.csv',index=False)
    print('done')


    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## district data quaterly: inserting data into fact_phase1_district_data_quaterly table

    f_path = os.path.join(PATH,"db_push","data","district_scores_quarter.csv")
    data = pd.read_csv(f_path)
    print(data.columns)
    print(data['date'].unique())
    print(len(data))

    with engine.connect() as con:
        con.execute('DELETE from fact_phase1_district_data_quaterly where date=(%s)',(quarter_date[0]))

    data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
                'indicator_index','indicator_rank','type_index','type_rank','date','quarter','year']]

    print(len(data))
    data.to_sql('fact_phase1_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def yearly_districtdata_upload(year_date,year):
    year = int(year) + 1
    #################### MAPPING district_id_num in district data ##############################
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly

    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_scores.csv')

    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly

    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_scores_quarter.csv')

    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    _date = year_date
    fpath1 = os.path.join(PATH,"data","district_scores_year.csv")
    districts_data = pd.read_csv(fpath1)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('db_push/data/district_scores.csv',index=False)
    # districts_data.to_csv('db_push/data/district_scores_quarter.csv',index=False)
    filpath = os.path.join(PATH,'db_push','data','district_scores_year.csv')
    districts_data.to_csv(filpath,index=False)
    print('done')


    ##################### connecting to database ################
    # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## district data yearly: inserting data into fact_phase1_district_data_yearly table

    filepath1 = os.path.join(PATH,"db_push","data","district_scores_year.csv")
    data = pd.read_csv(filepath1)

    print(data.columns)

    print(data['date'].unique())

    with engine.connect() as con:
        con.execute('DELETE from fact_phase1_district_data_yearly where year=(%s)',year)

    data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
                'indicator_index','indicator_rank','type_index','type_rank','date','year']]

    print(len(data))

    data.to_sql('fact_phase1_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def upload_analytics_date(month_date):

    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())
    filepath = os.path.join(PATH,"db_push","data","block_scores.csv")
    data = pd.read_csv(filepath, usecols= ['date','block_name','district','division'])
    data.rename(columns={'block_name':'block'},inplace=True)
    print(data.columns)
    print(data.date.unique())
    data["date"] = pd.to_datetime(data["date"]).dt.strftime('%Y-%m-%d')
    print(data)

    with engine.connect() as con:
        con.execute('DELETE from analytics_dropdown_data where date=(%s)',(month_date[0]))


    data.to_sql('analytics_dropdown_data', con=engine, if_exists='append', index=False, chunksize=2)





def push_to_db(prev_date,cur_date,year):
    date = cur_date
    current_date = datetime.strptime(str(date), "%Y%m")
    currQuarter = int((current_date.month - 1) / 3 + 1)
    dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)

        # print(dtFirstDay)

    q_frst = dtFirstDay.strftime("%Y-%m-%d")
    quat_date = [q_frst]
        # print(q_frst)
    # dates =[]
    # li = []
    # d = int(date)
    # qua_frst = int(q_frst)
    # while qua<=d:
    #     li.append(str(qua))
    #     qua+=1
    y = str(year) + '-04' +'-01'
    year_start = [y]
    month_date = datetime.strptime(str(cur_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")

    monthly_blockdata_upload([m_date])
    print("MONTHLY BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!")
    quarterly_blockdata_upload(quat_date)
    print("Quaterly BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!")
    yearly_blockdata_upload(year_start,year)
    print("Yearly BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!")
    monthly_districtdata_upload([m_date])
    print("Monthly District DATA UPLOADED SUCCESSFULLY!!!!!!!")
    quarterly_districtdata_upload(quat_date)
    print("Quarterly District DATA UPLOADED SUCCESSFULLY!!!!!!!")
    yearly_districtdata_upload(year_start,year)
    print("Yearly District DATA UPLOADED SUCCESSFULLY!!!!!!!")
    upload_analytics_date([m_date])
    print("UPLOADED SUCCESSFULLY!!!!!!!!!!!!!!!!!!!")














# #################### MAPPING block_id_num in block data ##############################

# block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
# # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
# # creates new column in block_cmo_scores.csv file to insert into Database

# # monthly

# # # _date = ['2022-03-01']
# # blocks_data = pd.read_csv('data/block_scores.csv')

# # # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # quaterly
# # _date = ['2022-01-01']
# # blocks_data = pd.read_csv('data/block_scores_quarter.csv')

# # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # yearly
# _date = '2021-04-01'
# blocks_data = pd.read_csv('data/block_scores_year.csv')
# blocks_data = blocks_data[blocks_data['date'] == _date]

# # **** code for sub indicator
# # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
# # sub_block = list(set(blocks_data['district_id']))
# # diff_blocks = list(set(sub_block) - set(blocks))
# # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
# #  ****


# blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x.strip()])
# blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
# blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

# # blocks_data.to_csv('db_push/data/block_scores.csv',index=False)
# # blocks_data.to_csv('db_push/data/block_scores_quarter.csv',index=False)
# blocks_data.to_csv('db_push/data/block_scores_year.csv',index=False)
# print('done')

# #################### MAPPING district_id_num in district data ##############################
# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

# # monthly

# # _date = ['2022-03-01']
# # districts_data = pd.read_csv('data/district_scores.csv')

# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # quarterly

# # _date = ['2022-01-01']
# # districts_data = pd.read_csv('data/district_scores_quarter.csv')

# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # yearly
# _date = '2021-04-01'
# districts_data = pd.read_csv('data/district_scores_year.csv')
# districts_data = districts_data[districts_data['date'] == _date]

# districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
# districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
# districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

# # districts_data.to_csv('db_push/data/district_scores.csv',index=False)
# # districts_data.to_csv('db_push/data/district_scores_quarter.csv',index=False)
# districts_data.to_csv('db_push/data/district_scores_year.csv',index=False)
# print('done')


# ##################### connecting to database ################
# # engine = sqlalchemy.create_engine('mysql+pymysql://root:Welcome@123@localhost/uptsu_temp')
# engine = sqlalchemy.create_engine(staging_db_connection)
# inspector = inspect(engine)
# print(inspector.get_table_names())

# ####### inserting data into fact tables #############

# ## block data monthly: inserting data into fact_phase1_block_data_monthly table

# data = pd.read_csv('db_push/data/block_scores.csv')

# print(data.columns)
# print(data['date'].unique())

# # data = data.query('date=="2020-05-01"')
# # data.info()
# print(len(data['date'].unique()))
# print("unique dates", data['date'].unique())
# print("len of unique dates",len(data['date'].unique()))
# print("len of data",len(data))

# print(len(data))

# data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
#              'indicator_rank','type_index','type_rank','perc_point','count','date']]

# print(data[data.duplicated()])
# data = data.astype(object).where(pd.notnull(data),None)

# data.to_sql('fact_phase1_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')



# ## block data quarterly: inserting data into fact_phase1_block_data_quaterly table

# data = pd.read_csv('db_push/data/block_scores_quarter.csv')
# print(data.columns)

# print(data['date'].unique())

# with engine.connect() as con:
#    con.execute('DELETE from fact_phase1_block_data_quaterly where date="2022-01-01"')

# print(len(data))

# data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
#              'indicator_rank','type_index','type_rank','perc_point','count','date','quarter','year']]

# data.drop_duplicates(['block_id_num','indicator_id','date'], inplace=True)

# print(data[data.duplicated()])
# print(len(data))
# data.to_sql('fact_phase1_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## block data yearly: inserting data into fact_phase1_block_data_yearly table

# data = pd.read_csv('db_push/data/block_scores_year.csv')

# print(data.columns)

# print(data['year'].unique())

# data['year'] = data['year'].astype(np.int64)

# print(len(data))

# with engine.connect() as con:
#    con.execute('DELETE from fact_phase1_block_data_yearly where year=2022')

# data = data[['block_id_num','indicator_id','composite_index','composite_rank','domain_index','domain_rank','indicator_index',
#              'indicator_rank','type_index','type_rank','perc_point','count','date','year']]

# print(len(data))

# print(data[data.duplicated()])

# data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','composite_index','year','date'])

# data.to_sql('fact_phase1_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## district data monthly: inserting data into fact_phase1_district_data_monthly table

# data = pd.read_csv('db_push/data/district_scores.csv')

# print(data.columns)

# print(data['date'].unique())

# print(len(data))

# print(data[data.duplicated()])

# data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
#              'indicator_index','indicator_rank','type_index','type_rank','date']]

# data = data.drop_duplicates(subset = ['district_id_num','indicator_id', 'perc_point'], keep='first')

# print(len(data))
# print(data.head(50))
# data.to_sql('fact_phase1_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## district data quaterly: inserting data into fact_phase1_district_data_quaterly table


# data = pd.read_csv('db_push/data/district_scores_quarter.csv')
# print(data.columns)
# print(data['date'].unique())
# print(len(data))

# with engine.connect() as con:
#    con.execute('DELETE from fact_phase1_district_data_quaterly where date="2022-01-01"')

# data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
#              'indicator_index','indicator_rank','type_index','type_rank','date','quarter','year']]

# print(len(data))
# data.to_sql('fact_phase1_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## district data yearly: inserting data into fact_phase1_district_data_yearly table


# data = pd.read_csv('db_push/data/district_scores_year.csv')

# print(data.columns)

# print(data['date'].unique())

# with engine.connect() as con:
#    con.execute('DELETE from fact_phase1_district_data_yearly where year=2022')

# data = data[['district_id_num','indicator_id','perc_point','composite_index','composite_rank','domain_index','domain_rank',
#              'indicator_index','indicator_rank','type_index','type_rank','date','year']]

# print(len(data))

# data.to_sql('fact_phase1_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')
