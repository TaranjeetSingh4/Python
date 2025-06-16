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

print(len(blocks))
print(len(districts))

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
f_pp = os.path.join(PATH,'ou_id_num_mappings.csv')
mapping.to_csv(f_pp)

mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
print(mapping_dicts.columns)

########## RUN SCRIPTS FROM HERE ##########

# month_date = ['2022-03-01']
# quarter_date = ['2022-03-01']
# year  = ['2022-03-01']

def monthly_block_update(month_date):
    # breakpoint()
    # mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    ## mapping block_id in block data

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # monthly
    _date = month_date
    filepathlocation1 = os.path.join(PATH,"data_niti","block_niti_scores.csv")
    blocks_data = pd.read_csv(filepathlocation1)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    # _date = ['2022-01-01']
    # blocks_data = pd.read_csv('data/block_niti_scores_quarter.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # blocks_data = pd.read_csv('data/block_niti_scores_year.csv')
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
    f_path = os.path.join(PATH,'db_push','data_niti','block_niti_scores.csv')

    blocks_data.to_csv(f_path,index=False)
    # blocks_data.to_csv('output/block_niti_scores_quarter.csv',index=False)
    # blocks_data.to_csv('output/block_niti_scores_year.csv',index=False)
    print('done')


    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ################# inserting data into fact tables #############
    ## block data monthly: inserting data into fact_niti_block_data_monthly table
    filepathlocation1 = os.path.join(PATH,"db_push","data_niti","block_niti_scores.csv")
    data = pd.read_csv(filepathlocation1)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date']]
    data.drop_duplicates(inplace=True)
    print(data[data.duplicated()])
    print(len(data))
    lis=[]

    with engine.connect() as con:
        k = con.execute('SELECT distinct(date) FROM fact_niti_block_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_niti_block_data_monthly where date=(%s)',(month_date[0]))

    print(lis)
    data.to_sql('fact_niti_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')


def quarterly_block_update(quarter_date):
        # mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    ## mapping block_id in block data

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # monthly
    # _date = ['2022-03-01']
    # blocks_data = pd.read_csv('data/block_niti_scores.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    _date = quarter_date
    f_pathlocation = os.path.join(PATH,"data_niti","block_niti_scores_quarter.csv")
    blocks_data = pd.read_csv(f_pathlocation)
    blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # blocks_data = pd.read_csv('data/block_niti_scores_year.csv')
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

    # blocks_data.to_csv('output/block_niti_scores.csv',index=False)
    f_pat = os.path.join(PATH,'db_push','data_niti','block_niti_scores_quarter.csv')
    blocks_data.to_csv(f_pat,index=False)
    # blocks_data.to_csv('output/block_niti_scores_year.csv',index=False)
    print('done')


    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## block data quaterly: inserting data into fact_niti_block_data_quaterly table
    file_pathlocation1 = os.path.join(PATH,"db_push","data_niti","block_niti_scores_quarter.csv")
    data = pd.read_csv(file_pathlocation1)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date','quarter','year']]
    print(len(data))
    data.drop_duplicates(inplace=True)
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_niti_block_data_quaterly where date=(%s)',(quarter_date[0]))
    data.to_sql('fact_niti_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def yearly_block_update(year_start,year):
    year = int(year) + 1
        # mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    ## mapping block_id in block data

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    # creates new column in block_cmo_scores.csv file to insert into Database

    # monthly
    # _date = ['2022-03-01']
    # blocks_data = pd.read_csv('data/block_niti_scores.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # quaterly
    # _date = ['2022-01-01']
    # blocks_data = pd.read_csv('data/block_niti_scores_quarter.csv')
    # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

    # yearly
    _date = year_start
    file_path_location1 = os.path.join(PATH,"data_niti","block_niti_scores_year.csv")
    blocks_data = pd.read_csv(file_path_location1)
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

    # blocks_data.to_csv('output/block_niti_scores.csv',index=False)
    # blocks_data.to_csv('output/block_niti_scores_quarter.csv',index=False)
    f_pa = os.path.join(PATH,'db_push','data_niti','block_niti_scores_year.csv')
    blocks_data.to_csv(f_pa,index=False)
    print('done')


    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ## block data yearly: inserting data into fact_niti_block_data_yearly table
    file_path_loct1 = os.path.join(PATH,"db_push","data_niti","block_niti_scores_year.csv")
    data = pd.read_csv(file_path_loct1)
    print(data.columns)
    print(data['date'].unique())
    data = data[['block_id_num','indicator_id','perc_point','date','year']]
    print(len(data))
    data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','date','year'])
    print(len(data))
    data.drop_duplicates(inplace=True)
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_niti_block_data_yearly where year=(%s)',(year))

    data.to_sql('fact_niti_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')

def monthly_district_update(month_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    _date = month_date
    file_path_loct1 = os.path.join(PATH,"data_niti","district_niti_scores.csv")
    districts_data = pd.read_csv(file_path_loct1)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_niti_scores_quarter.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # districts_data = pd.read_csv('data/district_niti_scores_year.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    f_path = os.path.join(PATH,'db_push','data_niti','district_niti_scores.csv')

    districts_data.to_csv(f_path,index=False)
    # districts_data.to_csv('output/district_niti_scores_quarter.csv',index=False)
    # districts_data.to_csv('output/district_niti_scores_year.csv',index=False)
    print('done')

    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ################# inserting data into fact tables #############


    ## district data monthly: inserting data into fact_niti_district_data_monthly table
    file_path_loct = os.path.join(PATH,"db_push","data_niti","district_niti_scores.csv")
    data = pd.read_csv(file_path_loct)
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
        k = con.execute('SELECT distinct(date) FROM fact_niti_district_data_monthly')

        for ro in k:
            d = ro[0].strftime("%Y-%m-%d")
            lis.append(d)

    if month_date[0] in lis:
        print("yes")
        with engine.connect() as con:
            con.execute('DELETE from fact_niti_district_data_monthly where date=(%s)',(month_date[0]))

    print(lis)
    data.to_sql('fact_niti_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def quaterly_district_update(quarter_date):
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_niti_scores.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    _date = quarter_date
    file_path_loc1 = os.path.join(PATH,"data_niti","district_niti_scores_quarter.csv")
    districts_data = pd.read_csv(file_path_loc1)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    # _date = ['2021-04-01']
    # districts_data = pd.read_csv('data/district_niti_scores_year.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('output/district_niti_scores.csv',index=False)
    fi_path = os.path.join(PATH,'db_push','data_niti','district_niti_scores_quarter.csv')
    districts_data.to_csv(fi_path,index=False)
    # districts_data.to_csv('output/district_niti_scores_year.csv',index=False)
    print('done')

    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ################# inserting data into fact tables #############

    ## district data quaterly: inserting data into fact_niti_district_data_quaterly table
    fpathloc1 = os.path.join(PATH,"db_push","data_niti","district_niti_scores_quarter.csv")
    data = pd.read_csv(fpathloc1)
    print(data.columns)
    print(data['date'].unique())

    data = data[['district_id_num','indicator_id','perc_point','date','quarter','year']]
    print(len(data))
    data.drop_duplicates(inplace=True)
    print(len(data))
    with engine.connect() as con:
        con.execute('DELETE from fact_niti_district_data_quaterly where date=(%s)',(quarter_date[0]))

    data.to_sql('fact_niti_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')




def yearly_district_update(year_date,year):
    year = int(year) + 1
    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
    print(mapping_dicts.columns)

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    # monthly
    # _date = ['2022-03-01']
    # districts_data = pd.read_csv('data/district_niti_scores.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # quarterly
    # _date = ['2022-01-01']
    # districts_data = pd.read_csv('data/district_niti_scores_quarter.csv')
    # districts_data = districts_data[districts_data['date'].isin(_date)]

    # yearly
    _date = year_date
    fpathloc1 = os.path.join(PATH,"data_niti","district_niti_scores_year.csv")
    districts_data = pd.read_csv(fpathloc1)
    districts_data = districts_data[districts_data['date'].isin(_date)]

    districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
    districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
    # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
    districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

    # districts_data.to_csv('output/district_niti_scores.csv',index=False)
    # districts_data.to_csv('output/district_niti_scores_quarter.csv',index=False)
    fil_path = os.path.join(PATH,'db_push','data_niti','district_niti_scores_year.csv')
    districts_data.to_csv(fil_path,index=False)
    print('done')

    # connecting to database

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
    engine = sqlalchemy.create_engine(staging_db_connection)
    inspector = inspect(engine)
    print(inspector.get_table_names())

    ################# inserting data into fact tables #############

    ## district data yearly: inserting data into fact_niti_district_data_yearly table
    fpathloc = os.path.join(PATH,"db_push","data_niti","district_niti_scores_year.csv")
    data = pd.read_csv(fpathloc)
    print(data.columns)
    print(data['date'].unique())
    data = data[['district_id_num','indicator_id','perc_point','date','year']]
    print(len(data))

    data.drop_duplicates(inplace=True)
    print(len(data))

    with engine.connect() as con:
        con.execute('DELETE from fact_niti_district_data_yearly where year=(%s)',(year))

    data.to_sql('fact_niti_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
    print('done')



def niti_db_push(prev_date,cur_date,year):
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
    # breakpoint()

    monthly_block_update([m_date])
    print("MONTHLY NITI BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")
    quarterly_block_update(quat_date)
    print("Quarterly NITI BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")
    yearly_block_update(year_start,year)
    print("YEARLY NITI BLOCK DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")
    monthly_district_update([m_date])
    print("MONTHLY NITI DISTRICT DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")
    quaterly_district_update(quat_date)
    print("QUARTERLY NITI DISTRICT DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")
    yearly_district_update(year_start,year)
    print("YEARLY NITI DISTRICT DATA UPLOADED SUCCESSFULLY!!!!!!!!!!")















# # mapping_dicts  = pd.read_csv('ou_id_num_mappings.csv')
# mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))
# print(mapping_dicts.columns)

# ## mapping block_id in block data

# block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
# # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
# # creates new column in block_cmo_scores.csv file to insert into Database

# # mothly
# # _date = ['2022-03-01']
# # blocks_data = pd.read_csv('data/block_niti_scores.csv')
# # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # quaterly
# # _date = ['2022-01-01']
# # blocks_data = pd.read_csv('data/block_niti_scores_quarter.csv')
# # blocks_data = blocks_data[blocks_data['date'].isin(_date)]

# # yearly
# _date = ['2021-04-01']
# blocks_data = pd.read_csv('data/block_niti_scores_year.csv')
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

# # blocks_data.to_csv('output/block_niti_scores.csv',index=False)
# # blocks_data.to_csv('output/block_niti_scores_quarter.csv',index=False)
# blocks_data.to_csv('output/block_niti_scores_year.csv',index=False)
# print('done')


# ## mapping district_id in district data


# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

# # monthly
# # _date = ['2022-03-01']
# # districts_data = pd.read_csv('data/district_niti_scores.csv')
# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # quarterly
# # _date = ['2022-01-01']
# # districts_data = pd.read_csv('data/district_niti_scores_quarter.csv')
# # districts_data = districts_data[districts_data['date'].isin(_date)]

# # yearly
# _date = ['2021-04-01']
# districts_data = pd.read_csv('data/district_niti_scores_year.csv')
# districts_data = districts_data[districts_data['date'].isin(_date)]

# districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
# districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
# districts_data.rename(columns={'domain':'domain_name', 'district':'district_name','type':'type_name', 'indicator':'indicator_name'},inplace=True)

# # districts_data.to_csv('output/district_niti_scores.csv',index=False)
# # districts_data.to_csv('output/district_niti_scores_quarter.csv',index=False)
# districts_data.to_csv('output/district_niti_scores_year.csv',index=False)
# print('done')

# # mapping block_id_num to su indicator block data
# block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
# # creates new column in block_cmo_scores.csv file to insert into Database

# blocks_data = pd.read_csv('May2020/sub/subindicator_scores_blocks_niti.csv')

# blocks_data['block_id_num'] = blocks_data['district_id'].apply(lambda x: block_mapping_dict[x])
# # blocks_data['indicator_id'] = blocks_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # blocks_data['calc_type'] = blocks_data['calc_type'].apply(lambda x: 1)
# blocks_data.rename(columns={'subindicator_id':'sub_indicator_id'},inplace=True)

# blocks_data.to_csv('output/subindicator_scores_blocks_niti.csv',index=False)





# # mapping district_id_num to su indicator district data

# district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

# districts_data = pd.read_csv('May2020/sub/subindicator_scores_districts_niti.csv')

# districts_data['district_id_num'] = districts_data['district_id'].apply(lambda x: district_mapping_dict[x])
# # districts_data['indicator_id'] = districts_data['indicator_id'].apply(lambda x: int(x.split('_')[1]))
# # districts_data['calc_type'] = districts_data['calc_type'].apply(lambda x: 1)
# districts_data.rename(columns={'subindicator_id':'sub_indicator_id'},inplace=True)

# districts_data.to_csv('output/subindicator_scores_districts_niti.csv',index=False)

# # connecting to database

# # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_temp')
# engine = sqlalchemy.create_engine(staging_db_connection)
# inspector = inspect(engine)
# print(inspector.get_table_names())

# ################# inserting data into fact tables #############
# ## block data monthly: inserting data into fact_niti_block_data_monthly table
# data = pd.read_csv('output/block_niti_scores.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date']]
# data.drop_duplicates(inplace=True)
# print(data[data.duplicated()])
# print(len(data))
# data.to_sql('fact_niti_block_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## block data quaterly: inserting data into fact_niti_block_data_quaterly table

# data = pd.read_csv('output/block_niti_scores_quarter.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date','quarter','year']]
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_niti_block_data_quaterly where date="2022-04-01"')
# data.to_sql('fact_niti_block_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## block data yearly: inserting data into fact_niti_block_data_yearly table

# data = pd.read_csv('output/block_niti_scores_year.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['block_id_num','indicator_id','perc_point','date','year']]
# print(len(data))
# data = data.drop_duplicates(['block_id_num','indicator_id','perc_point','date','year'])
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_niti_block_data_yearly where year=2023')

# data.to_sql('fact_niti_block_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')


# ## district data monthly: inserting data into fact_niti_district_data_monthly table

# data = pd.read_csv('output/district_niti_scores.csv')
# print(data.columns)
# print(len(data))
# print(data['date'].unique())
# data = data[['district_id_num','indicator_id','perc_point','date']]
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(len(data))
# print(len(data['indicator_id'].unique()))
# data.to_sql('fact_niti_district_data_monthly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## district data quaterly: inserting data into fact_niti_district_data_quaterly table

# data = pd.read_csv('output/district_niti_scores_quarter.csv')
# print(data.columns)
# print(data['date'].unique())

# data = data[['district_id_num','indicator_id','perc_point','date','quarter','year']]
# print(len(data))
# data.drop_duplicates(inplace=True)
# print(len(data))
# with engine.connect() as con:
#    con.execute('DELETE from fact_niti_district_data_quaterly where date="2022-04-01"')

# data.to_sql('fact_niti_district_data_quaterly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')

# ## district data yearly: inserting data into fact_niti_district_data_yearly table

# data = pd.read_csv('output/district_niti_scores_year.csv')
# print(data.columns)
# print(data['date'].unique())
# data = data[['district_id_num','indicator_id','perc_point','date','year']]
# print(len(data))

# data.drop_duplicates(inplace=True)
# print(len(data))

# with engine.connect() as con:
#    con.execute('DELETE from fact_niti_district_data_yearly where year=2023')

# data.to_sql('fact_niti_district_data_yearly',con=engine, if_exists='append', index=False,chunksize=2)
# print('done')
