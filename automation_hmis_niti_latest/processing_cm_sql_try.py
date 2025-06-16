import pandas as pd
import numpy as np
import os.path
import sqlalchemy
from sqlalchemy import MetaData, inspect
import pandas as pd
import numpy as np
import pymysql
from datetime import datetime
from gramex import variables
PATH = os.path.dirname(__file__)

staging_db_connection = variables['staging_db_connection']
mapping  = pd.read_csv(os.path.join(PATH, 'ou_id_mappings.csv'))
# mapping_updated = pd.read_excel('ou_id_mappings_updated.xlsx')

blocks = list(set(mapping['uid_block']))
districts = list(set(mapping['uid_district']))
divisions = list(set(mapping['uid_division']))

print(len(blocks),len(districts),len(divisions))

blocks_ids = {}
districts_ids = {}
divisions_ids = {}
for i in range(len(blocks)):
    blocks_ids[blocks[i]] = i+1
for j in range(len(districts)):
    districts_ids[districts[j]] = j+1
for k in range(len(divisions)):
    divisions_ids[divisions[k]] = k+1

# print(blocks_ids['ymNHOw3eRlW'])
# print(mapping.query('uid_block == "ymNHOw3eRlW"'))
mapping['block_id_num'] = mapping['uid_block'].apply(lambda x: blocks_ids[x])
# mapping['block_id_num'] = mapping['block_uid'].apply(lambda x: blocks_ids[x])
mapping['district_id_num'] = mapping['uid_district'].apply(lambda x: districts_ids[x])
# mapping['district_id_num'] = mapping['district_uid'].apply(lambda x: districts_ids[x])
mapping['division_id_num'] = mapping['uid_division'].apply(lambda x: divisions_ids[x])
# mapping['division_id_num'] = mapping['division_uid'].apply(lambda x: divisions_ids[x])
f_pa = os.path.join(PATH,'ou_id_num_mappings.csv')
mapping.to_csv(f_pa)

# run scripts  from here
# mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
print(mapping_dicts.columns)

# month_date = ['2022-03-01']
# quarter_date = ['2022-01-01']
# year_date = ['2021-04-01']

def monthly_block_update(month_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    ##### mapping block_id_num to block data


    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # mothly
    _date = month_date
    fpath = os.path.join(PATH, 'data_cm','lock_cm_scores.csv')
    blocks_data = pd.read_csv(fpath)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    # _date = ['2022-01-01']
    # blocks_data = pd.read_csv('data/block_cm_scores_quarter.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # # # yearly
    # _date = ['2021-04-01']
    # blocks_data = pd.read_csv('data/block_cm_scores_year.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x])
    # blocks_data['block_id_num'] = blocks_data['block'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['district_id_num'] = blocks_data['district_id'].apply(lambda x: district_mapping_dict[x])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)
    f_path = os.path.join(PATH,'db_push','data_cm','block_cm_scores.csv')

    blocks_data.to_csv(f_path,index=False)
    # blocks_data.to_csv('output/block_cm_scores_quarter.csv',index=False)
    # blocks_data.to_csv('output/block_cm_scores_year.csv',index=False)
    print('done')


    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    inspector.get_table_names()

    ### inserting data into fact_cm_block_data_monthly
    push_path = os.path.join(PATH, 'db_push','data_cm','block_cm_scores.csv')
    data = pd.read_csv(push_path)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date']]
    data.drop_duplicates(inplace=True)
    data[data.duplicated()]
    print(len(data))
    lis=[]

    with engine.connect() as con:
        k = con.execute('SELECT distinct(date) FROM fact_cm_block_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_cm_block_data_monthly where date=(%s)',(month_date[0]))

    print(lis)
    data.to_sql('fact_cm_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def quarterly_block_update(quarter_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    ##### mapping block_id_num to block data


    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # mothly
    # _date = ['2022-03-01']
    # blocks_data = pd.read_csv('data/block_cm_scores.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    _date = quarter_date

    fpath = os.path.join(PATH,'data_cm' ,'lock_cm_scores_quarter.csv')
    blocks_data = pd.read_csv(fpath)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # # # yearly
    # _date = ['2021-04-01']
    # blocks_data = pd.read_csv('data/block_cm_scores_year.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x])
    # blocks_data['block_id_num'] = blocks_data['block'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['district_id_num'] = blocks_data['district_id'].apply(lambda x: district_mapping_dict[x])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    push_path = os.path.join(PATH,'db_push','data_cm','block_cm_scores_quarter.csv')
    # blocks_data.to_csv('output/block_cm_scores.csv',index=False)
    blocks_data.to_csv(push_path,index=False)
    # blocks_data.to_csv('output/block_cm_scores_year.csv',index=False)
    print('done')


    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    inspector.get_table_names()

    data = pd.read_csv(push_path)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date','quarter','year']]
    data.drop_duplicates(inplace=True)
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_cm_block_data_quaterly where date=(%s)',(quarter_date))
    data.to_sql('fact_cm_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def yearly_block_update(year_date,year):
    year = int(year) + 1
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    ##### mapping block_id_num to block data


    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # mothly
    # _date = ['2022-03-01']
    # blocks_data = pd.read_csv('data/block_cm_scores.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    # _date = ['2022-01-01']
    # blocks_data = pd.read_csv('data/block_cm_scores_quarter.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # # # yearly
    _date = year_date
    f_path = os.path.join(PATH,"data_cm","lock_cm_scores_year.csv")
    # blocks_data = pd.read_csv('data_cm/lock_cm_scores_year.csv')
    blocks_data = pd.read_csv(f_path)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # **** code for sub indicator
    # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
    # sub_block = list(set(blocks_data['district_id']))
    # diff_blocks = list(set(sub_block) - set(blocks))
    # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
    #  ****


    blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x])
    # blocks_data['block_id_num'] = blocks_data['block'].apply(lambda x: block_mapping_dict[x.strip()])
    blocks_data['district_id_num'] = blocks_data['district_id'].apply(lambda x: district_mapping_dict[x])
    blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
    blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # blocks_data.to_csv('output/block_cm_scores.csv',index=False)
    # blocks_data.to_csv('output/block_cm_scores_quarter.csv',index=False)
    f_paths = os.path.join(PATH,'db_push','data_cm','block_cm_scores_year.csv')
    blocks_data.to_csv(f_paths,index=False)
    print('done')


    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    inspector.get_table_names()
    fpath = os.path.join(PATH,"db_push","data_cm","block_cm_scores_year.csv")
    data = pd.read_csv(fpath)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date','year']]
    print(len(data))
    data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','date','year'])
    print(len(data))
    data.drop_duplicates(inplace=True)
    print(data[data.duplicated()])
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_cm_block_data_yearly where year=(%s)',year)
    data.to_sql('fact_cm_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def monthly_district_update(month_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    # mapping district_id_num to district data

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    _date = month_date
    fpath = os.path.join(PATH,"data_cm","district_cm_scores.csv")
    districts_data = pd.read_csv(fpath)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_cm_scores_quarter.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # districts_data = pd.read_csv('data/district_cm_scores_year.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    fpath = os.path.join(PATH,'db_push','data_cm','district_cm_scores.csv')

    districts_data.to_csv(fpath,index=False)
    # districts_data.to_csv('output/district_cm_scores_quarter.csv',index=False)
    # districts_data.to_csv('output/district_cm_scores_year.csv',index=False)
    print('done')

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)

    inspector = inspect(engine)

    print(inspector.get_table_names())
    f_path1 = os.path.join(PATH,'db_push','data_cm','district_cm_scores.csv')
    data = pd.read_csv(f_path1)
    print(data.columns)

    print(len(data))
    print(data['date'].unique())
    data = data[['district_id_num','indicator_id','perc_point','date']]
    print(len(data))
    data.drop_duplicates(inplace=True)
    print(len(data))
    print(len(data['indicator_id'].unique()))

    lis=[]

    with engine.connect() as con:
        k = con.execute('SELECT distinct(date) FROM fact_cm_district_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_cm_district_data_monthly where date=(%s)',(month_date[0]))

    print(lis)
    data.to_sql('fact_cm_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')




def quaterly_district_update(quarter_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    # mapping district_id_num to district data

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_cm_scores.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    _date = quarter_date
    f_path2 = os.path.join(PATH,'data_cm','district_cm_scores_quarter.csv')
    districts_data = pd.read_csv(f_path2)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # districts_data = pd.read_csv('data/district_cm_scores_year.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('output/district_cm_scores.csv',index=False)
    f_p = os.path.join(PATH,'db_push','data_cm','district_cm_scores_quarter.csv')
    districts_data.to_csv(f_p,index=False)
    # districts_data.to_csv('output/district_cm_scores_year.csv',index=False)
    print('done')

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)

    inspector = inspect(engine)

    print(inspector.get_table_names())
    f_path3 = os.path.join(PATH,'db_push','data_cm','district_cm_scores_quarter.csv')
    data = pd.read_csv(f_path3)
    print(data.columns)
    print(data['date'].unique())
    data = data[['district_id_num','indicator_id','perc_point','date','quarter','year']]
    print(len(data['indicator_id'].unique()))
    print(len(data))
    data.drop_duplicates(inplace=True)
    data_dup = data[['district_id_num','indicator_id','date','quarter','year']]
    data_dup[data_dup.duplicated()]
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_cm_district_data_quaterly where date=(%s)',(quarter_date))
    data.to_sql('fact_cm_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def yearly_district_update(year_date,year):
    year = year +1
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)
    # mapping district_id_num to district data

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_cm_scores.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_cm_scores_quarter.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    _date = year_date
    f_path4 = os.path.join(PATH,'data_cm','district_cm_scores_year.csv')
    districts_data = pd.read_csv(f_path4)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('output/district_cm_scores.csv',index=False)
    # districts_data.to_csv('output/district_cm_scores_quarter.csv',index=False)
    f_pathp = os.path.join(PATH,'db_push','data_cm','district_cm_scores_year.csv')
    districts_data.to_csv(f_pathp,index=False)
    print('done')

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)

    inspector = inspect(engine)

    print(inspector.get_table_names())

    ## inserting data into fact_cm_district_data_yearly
    f_path5 = os.path.join(PATH,'db_push','data_cm','district_cm_scores_year.csv')
    data = pd.read_csv(f_path5)
    print(data.columns)
    print(data['date'].unique())
    print(len(data['indicator_id'].unique()))
    data = data[['district_id_num','indicator_id','perc_point','date','year']]
    print(len(data))
    data.drop_duplicates(inplace=True)
    data_dup = data[['district_id_num','indicator_id','date','year']]
    print(data_dup[data_dup.duplicated()])
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_cm_district_data_yearly where year=(%s)',year)

    data.to_sql('fact_cm_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')

def cm_db_push(prev_date,cur_date,year):
    # current_date = datetime.strptime(str(date), "%Y%m")
    # currQuarter = int((current_date.month - 1) / 3 + 1)
    # dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)

    #     # print(dtFirstDay)

    # q_frst = dtFirstDay.strftime("%Y%m")
    #     # print(q_frst)
    # dates =[]
    # li = []
    # d = int(date)
    # qua = int(q_frst)
    # while qua<=d:
    #     li.append(str(qua))
    #     qua+=1

    # # dates.append(li)
    # # print(li)
    # quarter_start = [qua]
    # year_start = [year + '-04' + '-01']
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

    monthly_block_update([m_date])
    quarterly_block_update(quat_date)
    yearly_block_update(year_start,year)
    monthly_district_update([m_date])
    quaterly_district_update(quat_date)
    yearly_district_update(year_start,year)






##################################         IGNORE        #################################################

##### mapping block_id_num to block data


# block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
# # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
# # creates new column in block_cmo_scores.csv file to insert into Database

# # mothly
# # _date = ['2022-03-01']
# # blocks_data = pd.read_csv('data/block_cm_scores.csv')
# # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # quaterly
# # _date = ['2022-01-01']
# # blocks_data = pd.read_csv('data/block_cm_scores_quarter.csv')
# # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # # # yearly
# _date = ['2021-04-01']
# blocks_data = pd.read_csv('data/block_cm_scores_year.csv')
# blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # **** code for sub indicator
# # blocks_data = blocks_data.query('subindicator_id !="0" and district == "C S M Nagar DHQ"')
# # sub_block = list(set(blocks_data['district_id']))
# # diff_blocks = list(set(sub_block) - set(blocks))
# # blocks_data = blocks_data[~blocks_data['district_id'].isin(diff_blocks)]
# #  ****


# blocks_data['block_id_num'] = blocks_data['block_id'].apply(lambda x: block_mapping_dict[x])
# # blocks_data['block_id_num'] = blocks_data['block'].apply(lambda x: block_mapping_dict[x.strip()])
# blocks_data['district_id_num'] = blocks_data['district_id'].apply(lambda x: district_mapping_dict[x])
# blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
# blocks_data.rename(columns={'domain':'domain_name', 'block':'block_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

# # blocks_data.to_csv('output/block_cm_scores.csv',index=False)
# # blocks_data.to_csv('output/block_cm_scores_quarter.csv',index=False)
# blocks_data.to_csv('output/block_cm_scores_year.csv',index=False)
# print('done')

# # mapping district_id_num to district data

# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

# # monthly
# # _date = ['2022-03-01']
# # districts_data = pd.read_csv('data/district_cm_scores.csv')
# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # quarterly
# # _date = ['2022-01-01']
# # districts_data = pd.read_csv('data/district_cm_scores_quarter.csv')
# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # yearly
# _date = ['2021-04-01']
# districts_data = pd.read_csv('data/district_cm_scores_year.csv')
# districts_data = districts_data[districts_data['date'].isin(_date)]

# districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
# districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
# districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

# # districts_data.to_csv('output/district_cm_scores.csv',index=False)
# # districts_data.to_csv('output/district_cm_scores_quarter.csv',index=False)
# districts_data.to_csv('output/district_cm_scores_year.csv',index=False)
# print('done')


# # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
# engine = sqlalchemy.create_engine(staging_db_connection)

# inspector = inspect(engine)

# print(inspector.get_table_names())

# ##################### inserting data into fact tables ###################

# #### block data

# ### inserting data into fact_cm_block_data_monthly

# data = pd.read_csv('output/block_cm_scores.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date']]
# data.drop_duplicates(inplace=True)
# data[data.duplicated()]
# print(len(data))
# data.to_sql('fact_cm_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## inserting data into fact_cm_block_data_quaterly

# data = pd.read_csv('output/block_cm_scores_quarter.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date','quarter','year']]
# data.drop_duplicates(inplace=True)
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_cm_block_data_quaterly where date="2022-01-01"')
# data.to_sql('fact_cm_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## inserting data into fact_cm_block_data_yearly

# data = pd.read_csv('output/block_cm_scores_year.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date','year']]
# print(len(data))
# data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','date','year'])
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(data[data.duplicated()])
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_cm_block_data_yearly where year=2022')
# data.to_sql('fact_cm_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ##### district data

# ## inserting data into fact_cm_district_data_monthly

# data = pd.read_csv('output/district_cm_scores.csv')
# print(data.columns)

# print(len(data))
# print(data['date'].unique())
# data = data[['district_id_num','indicator_id','perc_point','date']]
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(len(data))
# print(len(data['indicator_id'].unique()))
# data.to_sql('fact_cm_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## inserting data into fact_cm_district_data_quaterly

# data = pd.read_csv('output/district_cm_scores_quarter.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['district_id_num','indicator_id','perc_point','date','quarter','year']]
# print(len(data['indicator_id'].unique()))
# print(len(data))
# data.drop_duplicates(inplace=True)
# data_dup = data[['district_id_num','indicator_id','date','quarter','year']]
# data_dup[data_dup.duplicated()]
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_cm_district_data_quaterly where date="2022-01-01"')
# data.to_sql('fact_cm_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## inserting data into fact_cm_district_data_yearly

# data = pd.read_csv('output/district_cm_scores_year.csv')
# print(data.columns)
# print(data['date'].unique())
# print(len(data['indicator_id'].unique()))
# data = data[['district_id_num','indicator_id','perc_point','date','year']]
# print(len(data))
# data.drop_duplicates(inplace=True)
# data_dup = data[['district_id_num','indicator_id','date','year']]
# print(data_dup[data_dup.duplicated()])
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_cm_district_data_yearly where year=2022')

# data.to_sql('fact_cm_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')
