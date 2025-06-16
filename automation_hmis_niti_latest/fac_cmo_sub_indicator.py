import pandas as pd
from sqlalchemy import create_engine
import pymysql
from datetime import datetime
import os.path

PATH = os.path.dirname(__file__)

from gramex import variables

staging_db_connection = variables['staging_db_connection']

def cmo_subindicator_push(cur_date,year):
    month_date = datetime.strptime(str(cur_date),'%Y%m')
    m_date = month_date.strftime("%Y-%m-%d")
    # breakpoint()
    c_date = str(cur_date)
    year_date = str(year)


    conn = create_engine(staging_db_connection)
    fact_dis_sub = pd.read_csv(os.path.join(PATH, "data_cmo", "subindicator_scores_districts_cmo.csv"))
    fact_dis_sub = fact_dis_sub[(fact_dis_sub['date'] == c_date) | (fact_dis_sub['date'] == year_date) ]
    fact_dis_sub['date'] = m_date
    uniq_district = pd.read_csv(os.path.join(PATH, "uniq_district.csv"))
    fact_dis_sub = fact_dis_sub.merge(uniq_district, on='district_id', how='left')
    fact_dis_sub = fact_dis_sub[["date","district_id_num","subindicator_id","value"]]
    sub_indicator_id = pd.read_csv(os.path.join(PATH,'sub_indicaor_id.csv'))
    fact_dis_sub = fact_dis_sub.merge(sub_indicator_id, on='subindicator_id', how='left')
    fact_dis_sub['indicator_id'] = fact_dis_sub['indicator_id'].astype('int64')
    fact_dis_sub[fact_dis_sub['period'] == 'yearly']['value'] = (fact_dis_sub[fact_dis_sub['period'] == 'yearly']['value']/12) * 3
    fact_dis_sub = fact_dis_sub[["date","district_id_num","subindicator_id","value","indicator_id"]]
    fact_dis_sub.rename(columns={"subindicator_id": "sub_indicator_id"},inplace = True)
    lis=[]

    # with conn.connect() as con:
    #     k = con.execute('SELECT distinct(date) FROM fact_cmo_sub_indicator_district')

    #     for ro in k:
    #         d = ro[0].strftime("%Y-%m-%d")
    #         lis.append(d)

    # if month_date[0] in lis:
    #     print("yes")
    with conn.connect() as con:
        con.execute('DELETE from fact_cmo_sub_indicator_district where date=(%s)',(m_date))

    print(lis)

    fact_dis_sub.to_sql("fact_cmo_sub_indicator_district", con=conn, if_exists='append',index=False)
