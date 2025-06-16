import pandas as pd
from sqlalchemy import create_engine
import pymysql
import os.path
from gramex import variables
PATH = os.path.dirname(__file__)
staging_db_connection = variables['staging_db_connection']
def cmo_dist_year_push(year):
    year_d = year +1

    conn = create_engine(staging_db_connection)
    fact_dis_mon = pd.read_csv(os.path.join(PATH,'data_cmo/district_cmo_scores_year.csv'))
    fact_dis_mon = fact_dis_mon[fact_dis_mon['year'] == year_d]
    fact_dis_mon = fact_dis_mon[["year","district_id","indicator_id","perc_point"]]
    uniq_district = pd.read_csv(os.path.join(PATH,'uniq_district.csv'))
    fact_dis_mon = fact_dis_mon.merge(uniq_district, on='district_id', how='left')
    fact_dis_mon = fact_dis_mon[["year","district_id_num","indicator_id","perc_point"]]
    fact_dis_mon['indicator_id'] = fact_dis_mon['indicator_id'].str.replace('indicator_','')
    fact_dis_mon['indicator_id'] = fact_dis_mon['indicator_id'].astype('int64')
    # import pdb;pdb.set_trace()
    with conn.connect() as con:
        con.execute('DELETE from fact_cmo_district_score_yearly where year=(%s)',(year_d))

    fact_dis_mon.to_sql("fact_cmo_district_score_yearly", con=conn, if_exists='append',index=False)
