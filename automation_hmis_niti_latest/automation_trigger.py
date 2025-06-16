import pandas as pd
import gramex.cache
from datetime import datetime
import json
import os
import threading
import zipfile
import io
import traceback
from data_update_tracker import (
    create_tracker,
    update_tracker,
    get_fetch_status_track,
    get_track_by_id,
    update_tracker_by_parent_id,
)
from prod_push import push_to_prod_db

# fetch process
from uphealth_automation import trigger_fetch_process as trigger_hrd
from fetch_niti_auto import trigger_fetch_process as trigger_niti
from fetch_cm_auto import trigger_fetch_process as trigger_cm
from fetch_cmo_auto import trigger_fetch_process as trigger_cmo
from pa_calculation import trigger_fetch_process as trigger_phase2

# merge
from Indicators_15_16_block_merge import datamerge as indi_15_16_block_merge
from sub_indicator_block_merge import datamerge as sub_indi_block_merge
from sub_indicators_copy_cmo_niti_try import datamerge as cmo_niti_data_merge
from sub_indicators_copy_phase1_try import datamerge as phase1_data_merge
from sub_indicators_copy_prev_mnth_to_cur_month_cm_tb import datamerge as prev_cur_month_merge

# calculate
from phase1_calc import calculate_phase1_scores
from niti_etl import calculate_niti_scores
from cm_etl import calculate_score_cm
from cmo_etl import calculate_cmo_scores
from cm_sub_indicators import cm_sub_combine
from CM_level_merge_phase1_try import cm_phase1_ind_merge
from subindicator_block_cm_sql import subindicator_block_update
from subindicators_district_cm_sql import subindicator_district_update
from pa_calculation import caculate_phase2_data

# save in db
from processing_phase1_sql_try import push_to_db as hr_db_push
from processing_niti_sql_try import niti_db_push
from processing_cm_sql_try import cm_db_push
from fac_cmo_sub_indicator import cmo_subindicator_push
from fact_cmo_district_year import cmo_dist_year_push
from fact_cmo_table_district import cmo_dist_push

variables_config = gramex.cache.open('variables_config.yaml', 'yaml', rel=True)['variables']
PATH = os.path.dirname(__file__)


def dashboard_indicator_names(handler):
    api_data = {}
    args = handler.args
    dashboard_config = variables_config["dashboards"]
    dashboard_id = args.get('dashboard_id')[0] if args.get('dashboard_id') else None
    # print("dashboard_config", dashboard_config)
    dashboard_names = [
        {"dashboard_id": k, "dashboard_name": v.get('dashboard_name')}
        for k, v in dashboard_config.items()
        if k and v and v.get('dashboard_name')
    ]

    if dashboard_id is None:
        dashboard_id = list(dashboard_config.keys())[0] or None
    if dashboard_id:
        district_indicators = []
        block_indicators = []
        indicators_dist_file = dashboard_config.get(dashboard_id, {}).get(
            'indicators_district_file'
        )
        indicators_block_file = dashboard_config.get(dashboard_id, {}).get('indicators_block_file')
        try:
            if indicators_dist_file:
                # district
                indicators_dist_file_path = os.path.join(PATH, indicators_dist_file)
                indicators_dist_df = pd.read_csv(indicators_dist_file_path, encoding='utf-8')
                indicators_dist_df = indicators_dist_df[['indicator_name']]
                indicators_dist_df.drop_duplicates(subset='indicator_name', inplace=True)
                indicators_dist_df.dropna(inplace=True)
                district_indicators = indicators_dist_df.to_dict('records')
        except:
            error = traceback.format_exc()
            print("Error in getting district indicator names ", error)
            district_indicators = []

        try:
            # block
            if indicators_block_file:
                indicators_block_file_path = os.path.join(PATH, indicators_block_file)
                indicators_block_df = pd.read_csv(indicators_block_file_path, encoding='utf-8')
                indicators_block_df = indicators_block_df[['indicator_name']]
                indicators_block_df.drop_duplicates(subset='indicator_name', inplace=True)
                indicators_block_df.dropna(inplace=True)
                block_indicators = indicators_block_df.to_dict('records')
        except:
            error = traceback.format_exc()
            print("Error in getting block indicator names ", error)
            block_indicators = []

    else:
        district_indicators = []
        block_indicators = []

    api_data['dashboard_id'] = dashboard_id
    api_data['dashboard_name'] = dashboard_config.get(dashboard_id, {}).get('dashboard_name')
    api_data['district_indicators'] = district_indicators
    api_data['block_indicators'] = block_indicators
    api_data['all_dashboards'] = dashboard_names
    # api_data = json.dumps(api_data)
    return api_data


def execute_fetch(**kwargs):
    track_data = {}
    functn = kwargs.get('functn_name')
    if functn:
        try:
            c = create_tracker(kwargs, 'fetch', 'open')
            if c.get('done') is True and c.get('tracker_id'):
                resp = functn(kwargs)
                tid = c.get('tracker_id')
                track_data = update_tracker(
                    kwargs,
                    tid,
                    {
                        'stage': 'fetch',
                        'status': resp.get('status'),
                        'failure_reason': resp.get('error'),
                    },
                )
        except Exception as e:
            error = traceback.format_exc()
            tid = c.get('tracker_id')
            track_data = update_tracker(
                kwargs, tid, {'stage': 'fetch', 'status': 'failed', 'failure_reason': error}
            )
            print("Error in execute_fetch: ", e)

    return track_data


def fetch_indicators_data(handler, is_retry=False):
    if is_retry:
        track_data = get_fetch_status_track(handler)
        track_request = track_data.get('request_data')
        params = json.loads(track_request) if track_request else {}
        cancel_data_update(handler)
    else:
        params = handler.args

    user = handler.session.get('user', {}).get('user')
    if not user:
        return {}
    dashboard_id = params.get('dashboard_id')[0] if params.get('dashboard_id') else None
    status = "failed"
    try:
        if dashboard_id == 'health_ranking_dashboard':
            functn_name = trigger_hrd
        elif dashboard_id == 'niti_dashboard':
            functn_name = trigger_niti
        elif dashboard_id == 'cm_dashboard':
            functn_name = trigger_cm
        elif dashboard_id == 'cmo_dashboard':
            functn_name = trigger_cmo
        elif dashboard_id == 'phase2_dashboard':
            functn_name = trigger_phase2
        params['functn_name'] = functn_name
        params['user'] = user
        thread = threading.Thread(target=execute_fetch, kwargs=params)
        thread.daemon = True
        thread.start()
        status = "success"
    except Exception as e:
        status = "failed"
        print("Error in fetch_indicators_data: ", e)
    return {"status": status}


def download_data(handler):
    user = handler.session.get('user', {}).get('user')
    api_data = {"status": "failed", "filename": "", "filedata": ""}
    if not user:
        return api_data

    track_data = get_track_by_id(handler)
    track_request = track_data.get('request_data')
    track_request = json.loads(track_request) if track_request else {}

    if track_request and track_request.get('dashboard_id'):
        dashboard_id = track_request.get('dashboard_id')[0]
        dashboard_name = track_request.get('dashboard_name')[0]
        dashboard_config = variables_config["dashboards"]
        download_files = dashboard_config.get(dashboard_id, {}).get('download_files')
        file_path = dashboard_config.get(dashboard_id, {}).get('file_path')

        if download_files:
            zip_filename = "{}.zip".format(dashboard_name)
            file_obj = io.BytesIO()
            zf = zipfile.ZipFile(file_obj, "a", compression=zipfile.ZIP_DEFLATED)
            for fname in download_files:
                p = os.path.join(PATH, file_path, fname)
                zf.write(p, arcname=fname)
            zf.close()

            handler.set_header('Content-Type', 'application/octet-stream')
            handler.set_header(
                'Content-Disposition', 'attachment;filename={0}'.format(zip_filename)
            )
            return file_obj.getvalue()
    return api_data


def cancel_data_update(handler):
    params = handler.args
    user = handler.session.get('user', {}).get('user')
    params['user'] = user
    tracker_id = params.get('tracker_id')[0] if params.get('tracker_id') else None
    ptrack_data = update_tracker(params, tracker_id, {"is_cancelled": 1})
    # ctrack_data = update_tracker_by_parent_id(params, parent_id, {"is_cancelled": 1})
    return ptrack_data


def merge_data(params, track_data):
    args = track_data.get('request_data')
    args = json.loads(args) if args else {}
    parenttracker_id = track_data.get('parent_id')
    dashboard_id = args.get('dashboard_id')[0] if args.get('dashboard_id') else None
    fromdate = args.get('fromdate')[0] if args.get('fromdate') else None
    todate = args.get('todate')[0] if args.get('todate') else None
    year = args.get('year')[0] if args.get('year') else None
    prev_date = datetime.strptime(fromdate, '%Y-%m-%d').strftime('%Y%m')
    cur_date = datetime.strptime(todate, '%Y-%m-%d').strftime('%Y%m')
    prev_date = int(prev_date)
    cur_date = int(cur_date)
    year = int(year)
    status = "failed"
    try:
        c = create_tracker(params, 'merge', 'open', parenttracker_id)
        if dashboard_id == 'health_ranking_dashboard':
            indi_15_16_block_merge([cur_date])
            sub_indi_block_merge([dashboard_id], cur_date, year)
            phase1_data_merge(prev_date, cur_date)
        elif dashboard_id == 'niti_dashboard':
            cmo_niti_data_merge([dashboard_id], prev_date, cur_date)
            sub_indi_block_merge([dashboard_id], cur_date, year)
        elif dashboard_id == 'cm_dashboard':
            prev_cur_month_merge(prev_date, cur_date)
            sub_indi_block_merge([dashboard_id], cur_date, year)

        elif dashboard_id == 'cmo_dashboard':
            # sub_indi_block_merge([dashboard_id],cur_date,year)
            cmo_niti_data_merge([dashboard_id], str(prev_date), str(cur_date))
        tid = c.get('tracker_id')
        print("MERGED...", tid)
        update_tracker(params, tid, {'stage': 'merge', "status": "success"})
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        tid = c.get('tracker_id')
        update_tracker(
            params, tid, {'stage': 'merge', "status": "failed", "failure_reason": error}
        )
        # print("Error in merge_data: ", e)
    return {"status": status}


def calculate_data(params, track_data):
    args = track_data.get('request_data')
    args = json.loads(args) if args else {}
    parenttracker_id = track_data.get('parent_id')
    dashboard_id = args.get('dashboard_id')[0] if args.get('dashboard_id') else None
    fromdate = args.get('fromdate')[0] if args.get('fromdate') else None
    todate = args.get('todate')[0] if args.get('todate') else None
    year = args.get('year')[0] if args.get('year') else None
    prev_date = datetime.strptime(fromdate, '%Y-%m-%d').strftime('%Y%m')
    cur_date = datetime.strptime(todate, '%Y-%m-%d').strftime('%Y%m')
    prev_date = int(prev_date)
    cur_date = int(cur_date)
    year = int(year)
    status = "failed"
    try:
        c = create_tracker(params, 'calculate', 'open', parenttracker_id)
        if dashboard_id == 'health_ranking_dashboard':
            # calculate_phase1_scores(fromdate, todate)
            print("started **************************************")
            calculate_phase1_scores(prev_date, [cur_date], [year])
            print("my comment $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ")
        elif dashboard_id == 'niti_dashboard':
            # calculate_niti_scores(fromdate, todate)
            calculate_niti_scores(prev_date, [cur_date], [year])
        elif dashboard_id == 'cm_dashboard':
            # calculate_score_cm(fromdate,todate)
            calculate_score_cm(prev_date, [cur_date], [year])
            cm_sub_combine(prev_date, cur_date, year)
            cm_phase1_ind_merge(prev_date, cur_date, year)
        elif dashboard_id == 'cmo_dashboard':
            # calculate_cmo_scores(fromdate,todate)
            calculate_cmo_scores(prev_date, [cur_date], [year])
        elif dashboard_id == 'phase2_dashboard':
            caculate_phase2_data([str(cur_date)])
        tid = c.get('tracker_id')
        print("CALCULATED...", tid)
        update_tracker(params, tid, {'stage': 'calculate', "status": "success"})
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        tid = c.get('tracker_id')
        update_tracker(
            params, tid, {'stage': 'calculate', "status": "failed", 'failure_reason': error}
        )
        print("Error in calculate_data: ", e)
    return {"status": status}


def save_to_database(params, track_data):
    args = track_data.get('request_data')
    args = json.loads(args) if args else {}
    parenttracker_id = track_data.get('parent_id')
    dashboard_id = args.get('dashboard_id')[0] if args.get('dashboard_id') else None
    fromdate = args.get('fromdate')[0] if args.get('fromdate') else None
    todate = args.get('todate')[0] if args.get('todate') else None
    year = args.get('year')[0] if args.get('year') else None
    prev_date = datetime.strptime(fromdate, '%Y-%m-%d').strftime('%Y%m')
    cur_date = datetime.strptime(todate, '%Y-%m-%d').strftime('%Y%m')
    prev_date = int(prev_date)
    cur_date = int(cur_date)
    year = int(year)
    status = "failed"
    try:
        c = create_tracker(params, 'save', 'open', parenttracker_id)
        if dashboard_id == 'health_ranking_dashboard':
            hr_db_push(prev_date, cur_date, year)
        elif dashboard_id == 'niti_dashboard':
            niti_db_push(prev_date, cur_date, year)
        elif dashboard_id == 'cm_dashboard':
            cm_db_push(prev_date, cur_date, year)
            subindicator_block_update(cur_date, year)
            subindicator_district_update(cur_date, year)
        elif dashboard_id == 'cmo_dashboard':
            cmo_subindicator_push(cur_date, year)
            cmo_dist_year_push(year)
            cmo_dist_push(cur_date)
        tid = c.get('tracker_id')
        print("SAVED IN TEST DB ..", tid)
        update_tracker(params, tid, {'stage': 'save', "status": "success"})
        status = "success"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        tid = c.get('tracker_id')
        update_tracker(params, tid, {'stage': 'save', "status": "failed", 'failure_reason': error})
        print("Error in save_to_database: ", e)
    return {"status": status}


def save_indicators_data(handler):
    """This function Performs Merge, Calculate, Save in Database"""
    params = handler.args
    user = handler.session.get('user', {}).get('user')
    params['user'] = user
    track_data = get_track_by_id(handler)
    parenttracker_id = track_data.get('parent_id')
    if params.get("is_retry") == True:
        cancel_data_update(handler)
    status = "failed"
    try:
        # call merge
        m_status = merge_data(params, track_data)
        # call calculations
        if m_status and m_status.get('status') == "success":
            c_status = calculate_data(params, track_data)
            if c_status and c_status.get('status') == "success":
                # Call save in DB
                s_status = save_to_database(params, track_data)
                if s_status and s_status.get("status") == "success":
                    status = "success"
    except Exception as e:
        status = "failed"

    return {"status": status}


def start_save_process(handler):
    start_status = "failed"
    try:
        thread = threading.Thread(target=save_indicators_data, args=(handler,))
        thread.daemon = True
        thread.start()
        # save_indicators_data(handler)
        start_status = "success"
    except Exception as e:
        print("Error in execute_fetch: ", e)
        start_status = "failed"

    return {"status": start_status}


def pushtodb(handler):
    """This function Performs data push to Prod Database"""
    status = "failed"
    user = handler.session.get('user', {}).get('user')
    if not user:
        return {}
    try:
        params = handler.args
        params['user'] = user
        track_data = get_track_by_id(handler)
        parenttracker_id = track_data.get('parent_id')
        if params.get("is_retry") == True:
            cancel_data_update(handler)
        # push data
        c = create_tracker(params, 'push', 'open', parenttracker_id)
        tid = c.get('tracker_id')
        pushstatus = push_to_prod_db(handler, track_data)
        # mark pipeline completed
        if pushstatus and pushstatus.get('status') == "success":
            update_tracker(params, tid, {'stage': 'push', "status": "success"})
            mark_data_upload_complete(handler)
            print("PUSHED TO PROD DB...success", tid)
            status = "success"
        else:
            update_tracker(
                params,
                tid,
                {'stage': 'push', "status": "failed", 'failure_reason': pushstatus.get("error")},
            )
            print(
                "PUSHED TO PROD DB...failed",
                tid,
            )
            status = "failed"
    except Exception as e:
        error = traceback.format_exc()
        status = "failed"
        tid = c.get('tracker_id')
        update_tracker(params, tid, {'stage': 'push', "status": "failed", 'failure_reason': error})
        print("Error in pushtodb: ", e)

    return {"status": status}


def start_push_process(handler):
    start_status = "failed"
    try:
        thread = threading.Thread(target=pushtodb, args=(handler,))
        thread.daemon = True
        thread.start()
        # save_indicators_data(handler)
        start_status = "success"
    except Exception as e:
        print("Error in execute_fetch: ", e)
        start_status = "failed"

    return {"status": start_status}


def mark_data_upload_complete(handler):
    status = "failed"
    try:
        params = handler.args
        track_data = get_track_by_id(handler)
        fetch_tid = track_data.get('tracker_id')
        p_tid = track_data.get('parent_id')
        user = handler.session.get('user', {}).get('user')
        params['user'] = user
        update_tracker(params, p_tid, {"is_completed": 1})
        update_tracker_by_parent_id(params, p_tid, {"is_completed": 1})
        status = "success"
    except:
        status = "failed"

    return {"status": status}


def draft_process(handler):
    """Draft the fetch stage"""
    status = "failed"
    track = {}
    user = handler.session.get('user', {}).get('user')
    args = handler.args
    try:
        args['user'] = user
        # tracker_id = args.get('tracker_id')[0] if args.get('tracker_id') else None
        parent_id = args.get('parent_id')[0] if args.get('parent_id') else None
        update_tracker(args, parent_id, {"is_drafted": 1})
        update_tracker_by_parent_id(args, parent_id, {"is_drafted": 1})
        status = "success"
    except:
        status = "failed"

    return {"status": status, "track": track}


def upload_file(handler):
    # breakpoint()
    status = "failed"
    args = handler.args
    try:
        allfiles = handler.request.files.get("file")
        file_data = allfiles[0] if allfiles else {}
        dashboard_id = args.get('dashboard_id')[0] if args.get('dashboard_id') else None
        dashboard_config = variables_config["dashboards"]
        file_path = dashboard_config.get(dashboard_id, {}).get('file_path')
        # download_files = dashboard_config.get(dashboard_id, {}).get('download_files')
        filename = file_data.get("filename")
        body = file_data.get("body")
        full_path = os.path.join(PATH, file_path, filename)
        print("FUL", full_path)
        if not os.path.exists(full_path):
            dirname = os.path.dirname(full_path)
            if not os.path.isdir(dirname):
                os.makedirs(dirname)
        try:
            with open(full_path, 'wb') as fp:
                fp.write(body)
            status = "success"
        except IOError:
            status = "failed"
    except:
        status = "failed"
    return {"status": status}
