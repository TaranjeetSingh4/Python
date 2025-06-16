import sqlalchemy
from sqlalchemy import MetaData, inspect
import pandas as pd
import numpy as np
import pymysql
import traceback
from datetime import datetime
from gramex import variables
import json

staging_db_connection = variables['staging_db_connection']

prod_db_connection = variables['production_db_connection']


def push_to_prod_db(handler, params):
    # staging is a test/staging db
    # production is a production db
    pushstatus = {"status": "failed", "error": None}
    staging_engine = sqlalchemy.create_engine(staging_db_connection)
    production_engine = sqlalchemy.create_engine(prod_db_connection)
    parenttracker_id = params.get('tracker_id')
    request_data = params.get('request_data')
    request_data = json.loads(request_data) if request_data else {}
    dashboard_id = (
        request_data.get('dashboard_id')[0] if request_data.get('dashboard_id') else None
    )
    fromdate = request_data.get('fromdate')[0] if request_data.get('fromdate') else None
    todate = request_data.get('todate')[0] if request_data.get('todate') else None
    year = request_data.get('year')[0] if request_data.get('year') else None
    dashboard_id = (
        request_data.get('dashboard_id')[0] if request_data.get('dashboard_id') else None
    )
    try:
        db_tables = []
        if dashboard_id == "health_ranking_dashboard":
            db_tables = [
                "fact_phase1_block_data_monthly",
                "fact_phase1_block_data_quaterly",
                "fact_phase1_block_data_yearly",
                "fact_phase1_district_data_monthly",
                "fact_phase1_district_data_quaterly",
                "fact_phase1_district_data_yearly",
                "analytics_dropdown_data",
            ]
        elif dashboard_id == "niti_dashboard":
            db_tables = [
                "fact_niti_block_data_monthly",
                "fact_niti_block_data_quaterly",
                "fact_niti_block_data_yearly",
                "fact_niti_district_data_monthly",
                "fact_niti_district_data_quaterly",
                "fact_niti_district_data_yearly",
            ]
        elif dashboard_id == "cm_dashboard":
            db_tables = [
                "fact_cm_block_data_monthly",
                "fact_cm_block_data_quaterly",
                "fact_cm_block_data_yearly",
                "fact_cm_district_data_monthly",
                "fact_cm_district_data_quaterly",
                "fact_cm_district_data_yearly",
                "fact_cm_sub_indicator_block",
                "fact_cm_sub_indicator_district",
            ]
        elif dashboard_id == "cmo_dashboard":
            db_tables = [
                "fact_cmo_district_data_monthly",
                "fact_cmo_district_score_yearly",
                "fact_cmo_sub_indicator_district",
            ]

        table_filter_column_mapping = {"fact_cmo_district_score_yearly": "year"}

        for table in db_tables:
            table = table.lower()
            filter_dates = []
            column = None
            # special cases for specific tables
            if dashboard_id == "health_ranking_dashboard" and table == "analytics_dropdown_data":
                filter_dates.append(todate)

            elif dashboard_id == "cm_dashboard" and table in [
                "fact_cm_sub_indicator_block",
                "fact_cm_sub_indicator_district",
            ]:
                filter_dates.append(todate)
                yr_date = str(year) + '-04' + '-01'
                filter_dates.append(yr_date)

            elif dashboard_id == "cmo_dashboard":
                if table in ["fact_cmo_district_score_yearly"]:
                    yr = int(year) + 1
                    filter_dates.append(yr)
                elif table in [
                    "fact_cmo_district_data_monthly",
                    "fact_cmo_sub_indicator_district",
                ]:
                    filter_dates.append(todate)

            elif table.endswith("monthly"):
                # send todate
                filter_dates.append(todate)
            elif table.endswith("quaterly"):
                # using todate calculate quarter
                current_date = datetime.strptime(str(todate), "%Y-%m-%d")
                currQuarter = int((current_date.month - 1) / 3 + 1)
                dtFirstDay = datetime(current_date.year, 3 * currQuarter - 2, 1)
                q_frst = dtFirstDay.strftime("%Y-%m-%d")
                filter_dates.append(q_frst)
            elif table.endswith("yearly"):
                # using year calculate year start (Financial year starts with April)
                yr_date = str(year) + '-04' + '-01'
                filter_dates.append(yr_date)

            column = table_filter_column_mapping.get(table)
            if column is None:
                column = "date"
            for d in filter_dates:
                if table and d:
                    test_db_query = """ SELECT * FROM {table} WHERE {column} = '{date}' """
                    test_db_query = test_db_query.format(
                        **{"table": table, "column": column, "date": d}
                    )
                    # read test db data which is to be pushed into prod db
                    test_db_data = pd.read_sql(test_db_query, con=staging_engine)
                    # before push to prod db - delete data in prod db using date column to avoid duplicates if data already exists
                    with production_engine.connect() as prod_con:
                        delete_query = """ DELETE FROM {table} WHERE {column} = '{date}' """
                        delete_query = delete_query.format(
                            **{"table": table, "column": column, "date": d}
                        )
                        prod_con.execute(delete_query)
                    # push test db data to prod db
                    test_db_data.to_sql(
                        table, con=production_engine, if_exists='append', index=False, chunksize=2
                    )
                    print("## Push to Prod database table: ", table)
        pushstatus["status"] = "success"
        print("## Push to Prod database: ** ", pushstatus.get("status"), " **")
    except:
        error = traceback.format_exc()
        pushstatus["status"] = "failed"
        pushstatus["error"] = error
        print("Error in Push to Prod database ", error)
        print("## Push to Prod database: ** ", pushstatus.get("status"), " **")

    return pushstatus
