import pandas as pd
from sqlalchemy import create_engine
import pymysql
from datetime import datetime
from gramex import variables
import os.path
PATH = os.path.dirname(__file__)
staging_db_connection = variables['staging_db_connection']

def cmo_dist_push(cur_date):
    month_date = datetime.strptime(str(cur_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")

    conn = create_engine(staging_db_connection)
    fact_dis_mon = pd.read_csv(os.path.join(PATH, 'data_cmo/district_cmo_scores.csv'))
    fact_dis_mon = fact_dis_mon[fact_dis_mon['date'] == m_date]
    fact_dis_mon = fact_dis_mon[["date","district_id","indicator_id","perc_point"]]
    uniq_district = pd.read_csv(os.path.join(PATH, 'uniq_district.csv'))
    fact_dis_mon = fact_dis_mon.merge(uniq_district, on='district_id', how='left')
    fact_dis_mon = fact_dis_mon[["date","district_id_num","indicator_id","perc_point"]]
    fact_dis_mon['indicator_id'] = fact_dis_mon['indicator_id'].str.replace('indicator_','')
    fact_dis_mon['indicator_id'] = fact_dis_mon['indicator_id'].astype('int64')
    # import pdb;pdb.set_trace()
    lis=[]

    # with conn.connect() as con:
    #     k = con.execute('SELECT distinct(date) FROM fact_cmo_district_data_monthly')

    #     for ro in k:
    #         d = ro[0].strftime("%Y-%m-%d")
    #         lis.append(d)

    # if month_date[0] in lis:
    #     print("yes")
    with conn.connect() as con:
        con.execute('DELETE from fact_cmo_district_data_monthly where date=(%s)',(m_date))

    print(lis)
    fact_dis_mon.to_sql("fact_cmo_district_data_monthly", con=conn, if_exists='append',index=False)
