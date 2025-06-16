import pandas as pd

import sqlalchemy
from sqlalchemy import MetaData, inspect
import pandas as pd
import numpy as np
import numpy as np
import pymysql
from datetime import datetime
from gramex import variables
import os.path
PATH = os.path.dirname(__file__)

staging_db_connection = variables['staging_db_connection']
def subindicator_district_update(cur_date,year):
    # breakpoint()
    fpa = os.path.join(PATH,'CM_data','subindicator_districts_cm.csv')
    sub_dist = pd.read_csv(fpa)
    month_date = datetime.strptime(str(cur_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")

    curr_date = m_date

    curr_year = str(year)

    print(sub_dist.info())

    print(len(sub_dist))

    print(sub_dist['sub_id'].unique())

    print(sub_dist[sub_dist['sub_id'].isnull()]['subindicator_id'].unique())

    print(len(sub_dist[sub_dist['sub_id'].isnull()]))

    sub_dist.drop(sub_dist[sub_dist['sub_id'].isnull()].index, inplace=True)
    print(len(sub_dist))
    fba = os.path.join(PATH,'ou_id_num_mappings.csv')
    mapping_dicts  = pd.read_csv(fba)
    print(mapping_dicts.columns)

    district_mapping_dict = dict(zip(mapping_dicts['uid_district'], mapping_dicts['district_id_num']))
    division_id = dict(zip(mapping_dicts['division'], mapping_dicts['uid_division']))
    divison_mapping_dict = dict(zip(mapping_dicts['uid_division'], mapping_dicts['division_id_num']))

    print(len(district_mapping_dict))
    print(len(divison_mapping_dict))

    sub_dist['district_id_num'] = sub_dist['district_id'].apply(lambda x: district_mapping_dict[x])
    sub_dist['division_id'] = sub_dist['division'].apply(lambda x: division_id[x])
    sub_dist['division_id_num'] = sub_dist['division_id'].apply(lambda x: divison_mapping_dict[x])
    sub_dist.rename(columns={'indicator_id': 'indicator_id_var'}, inplace=True)
    sub_dist['indicator_id'] = sub_dist['indicator_id_var'].apply(lambda x: int(x.split('_')[1]))
    sub_dist['sub_indicator_type']  = sub_dist['sub_id'].apply(lambda x: 'Numerator' if x[-1] == 'a' else 'Denominator')
    sub_dist.rename(columns={'subindicator_id':'sub_indicator_id'},inplace=True)

    print(sub_dist.date.unique())
    fpath = os.path.join(PATH,'db_push','data_cm','subindicator_districts_cm.csv')
    sub_dist.to_csv(fpath,index=False)


    # engine = sqlalchemy.create_engine('mysql://root:root@123@localhost/uptsu_pwd')
    engine = sqlalchemy.create_engine(staging_db_connection)

    inspector = inspect(engine)
    print(inspector.get_table_names())

    #### uploading data into fact tables districts

    sub_dist = pd.read_csv(fpath)
    print(sub_dist.columns)
    print(sub_dist.date.unique())
    sub_dist.rename(columns={'subindicator_id': 'sub_indicator_id'}, inplace=True)
    data = sub_dist[['district_id_num','division_id_num', 'div_map_id', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year', 'value']]
    print(len(data))
    print(data[data.duplicated()])
    # data.drop_duplicates(inplace=True)
    data.drop_duplicates(subset=['district_id_num','division_id_num', 'div_map_id', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year'], inplace=True)

    print(data.date.unique())
    duplicates = data[['district_id_num','division_id_num', 'div_map_id', 'indicator_id', 'sub_indicator_id', 'date', 'quarter', 'year', ]]
    duplicates = duplicates[duplicates.duplicated()]
    print(duplicates)
    print(duplicates.sub_indicator_id.unique())
    print(len(data[data['date']== curr_date]))
    # breakpoint()
    # with engine.connect() as con:
    #     con.execute("""DELETE from fact_cm_sub_indicator_district where date='{}' """.format(curr_year))
    with engine.connect() as con:
        con.execute("""DELETE from fact_cm_sub_indicator_district where date='{}' """.format(curr_year))
        con.execute("""DELETE from fact_cm_sub_indicator_district where date='{}' """.format(m_date))

    data.to_sql('fact_cm_sub_indicator_district', con=engine, if_exists='append', index=False, chunksize=2)
    print('done')
