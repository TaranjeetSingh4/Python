import pandas as pd
import sqlalchemy
from sqlalchemy import MetaData, inspect
import pandas as pd
import numpy as np
import pymysql
from datetime import datetime
from gramex import variables
import os.path
PATH = os.path.dirname(__file__)

staging_db_connection = variables['staging_db_connection']
def subindicator_block_update(curr_date,year):
    filepa = os.path.join(PATH,'CM_data','subindicator_blocks_cm.csv')
    sub_block = pd.read_csv(filepa)

    month_date = datetime.strptime(str(curr_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")

    print(sub_block.info())
    print(sub_block.date.unique())


    mapping_dicts  = pd.read_csv(os.path.join(PATH, 'ou_id_num_mappings_newer_merged.csv'))

    print(mapping_dicts.columns)

    block_mapping_dict = dict(zip(mapping_dicts['uid_block'], mapping_dicts['block_id_num']))
    # block_mapping_dict = dict(zip(mapping_dicts['block'], mapping_dicts['block_id_num']))
    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))

    print(len(block_mapping_dict))
    print(len(district_mapping_dict))

    sub_block['block_id_num'] = sub_block['block_id'].apply(lambda x: block_mapping_dict[x])
    sub_block.rename(columns={'indicator_id': 'indicator_id_var'}, inplace=True)

    sub_block['indicator_id'] = sub_block['indicator_id_var'].apply(lambda x: int(x.split('_')[1]))

    print(sub_block.date.unique())
    fpath = os.path.join(PATH,'db_push','data_cm','subindicator_blocks_cm.csv')
    sub_block.to_csv(fpath,index=False)

    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_pwd')
    engine = sqlalchemy.create_engine(staging_db_connection)

    inspector = inspect(engine)

    print(inspector.get_table_names())

    ################ Inserting data into fact tables ##############
    fp = os.path.join(PATH,'db_push','data_cm','subindicator_blocks_cm.csv')
    sub_block = pd.read_csv(fp)
    print(sub_block.columns)
    print(sub_block.date.unique())

    sub_block.rename(columns={'subindicator_id': 'sub_indicator_id'}, inplace=True)
    data = sub_block[['block_id_num', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year', 'value']]
    print(data.columns)

    print(data.date.unique())

    duplicates = data[['block_id_num', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year']]
    duplicates = duplicates[duplicates.duplicated()]
    duplicates.sub_indicator_id.unique()
    print(duplicates.date.unique())
    # print(duplicates[duplicates['date']=='2022-03-01']['sub_indicator_id'].unique())
    # print(duplicates[duplicates['date']=='2022-03-01'])
    data.drop_duplicates(subset=['block_id_num', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year'], inplace=True)
    print(data.date.unique())
    # print(len(data[data['date']=='2021']))
    print(data)
    # breakpoint()
    # day = str(year)
    with engine.connect() as con:
        con.execute("""DELETE from fact_cm_sub_indicator_block where date='{}' """.format(year))
        con.execute("""DELETE from fact_cm_sub_indicator_block where date='{}' """.format(m_date))

    data.to_sql('fact_cm_sub_indicator_block', con=engine, if_exists='append', index=False, chunksize=2)
    print('done')
