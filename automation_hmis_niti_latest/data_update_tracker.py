# coding: utf-8
"""
data update tracker
stage:
  "fetch": 1 - once data is fetch from API.
  "merge": 2 - once data file is merged.
  "calculate": 3 - once data is processed & calculated
  "save": 4 - once data pushed into Test DB server
  "push": 5 -  once data pushed into prod DB server
status:
    "open" - inprogress
    "success" - success - allows for next state
    "failed" - failed doesnot allows for next state
eg:
stage="fetch", status = "success"
stage="fetch", status = "failed"

"""

import json
import gramex
from gramex.config import variables
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dateutil.tz import gettz
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

staging_db_connection = variables['staging_db_connection']


def create_tracker(params, stage, status, parent_id=None):
    """
    Insert the tracker data
    """
    user = params.get('user')
    db_data = {}
    req_keys = [
        "district_indicator_ids[]",
        "block_indicator_ids[]",
        "dashboard_id",
        "dashboard_name",
        "fromdate",
        "todate",
        "year",
    ]
    request_data = {k: v for k, v in params.items() if k in req_keys}
    request_data = json.dumps(request_data)
    try:
        if stage == 'fetch':
            status='success'
        tracker_data = {
            'stage': [stage],
            'status': [status],
            'created_by': [user],
            'updated_by': [user],
            'created_at': [datetime.utcnow()],
            'updated_at': [datetime.utcnow()],
            'request_data': [request_data],
            'parent_id': [parent_id],
            'is_completed': [0],
            'is_drafted': [0],
            'is_cancelled': [0],
        }
        gramex.data.insert(
            staging_db_connection, table='data_update_tracker', args=tracker_data, id=['id']
        )
        df = gramex.data.filter(
            url=staging_db_connection,
            query='''select id as tracker_id
                    from data_update_tracker
                    order by id desc limit 1''',
        )
        if not df.empty:
            db_data = df.to_dict("records")[0] if df.to_dict("records") else {}
            db_data['done'] = True

    except Exception as e:
        print("Error in create_tracker: ", e)
        return db_data

    return db_data


def create_tracker_failure(params, tracker_id, failure_reason):
    """
    Insert the failure data
    """
    user = params.get('user')
    db_data = {}
    if tracker_id and failure_reason:
        try:
            fetch_id=gramex.data.filter(
                staging_db_connection, table='data_update_failure',query='select max(id) as id from data_update_failure')
            
            id=int(dict(fetch_id['id'])[0]) + 1

            tracker_data = {
                'id':str(id),
                'tracker_id': [tracker_id],
                'failure_reason': [failure_reason],
                'created_by': [user],
                'updated_by': [user],
                'created_at': [datetime.utcnow()],
                'updated_at': [datetime.utcnow()],
            }
            gramex.data.insert(
                staging_db_connection, table='data_update_failure', args=tracker_data,_type='sql'
            )
            df = gramex.data.filter(
                url=staging_db_connection,
                query='''select id as failure_id, tracker_id, failure_reason
                        from data_update_failure
                        where tracker_id = :tracker_id
                        order by id desc limit 1''',
                args={"tracker_id": [tracker_id]},
            )
            if not df.empty:
                db_data = df.to_dict("records")[0] if df.to_dict("records") else {}
                db_data['done'] = True

        except Exception as e:
            print("Error in create_tracker_failure: ", e)
            return db_data

    return db_data


def update_tracker(params, tracker_id, update_values):
    """
    Update the tracker data
    """
    user = params.get('user')
    updated_data = {}
    failure_data = []
    if (not user) or (not tracker_id):
        return {}

    try:
        tracker_data = {}
        tracker_data['id'] = [tracker_id]
        for key, val in update_values.items():
            tracker_data[key] = [val]

        tracker_data['updated_by'] = [user]
        tracker_data['updated_at'] = [datetime.utcnow()]
        tracker_data['is_completed'] = tracker_data.get('is_completed', [0])
        tracker_data['is_drafted'] = tracker_data.get('is_drafted', [0])
        # tracker_data['is_cancelled'] = tracker_data.get('is_cancelled', [0])

        if tracker_data.get('is_completed', [0]) == [1] or tracker_data.get('is_drafted', [0]) == [1]:
            tracker_data.pop('updated_at', None)

        print("update_tracker - ", tracker_data)
        gramex.data.update(
            staging_db_connection, table='data_update_tracker', args=tracker_data, id=['id']
        )

        failure_reason = tracker_data.get('failure_reason', None)
        if failure_reason:
            failure_data = create_tracker_failure(params, tracker_id, failure_reason)

        df = gramex.data.filter(
            url=staging_db_connection,
            query='''select id as tracker_id, status, stage
                    from data_update_tracker where id = :id''',
            args={"id": [tracker_id]},
        )
        if not df.empty:
            updated_data = df.to_dict("records")[0] if df.to_dict("records") else {}
            updated_data['done'] = True
            updated_data['failure_data'] = failure_data

    except Exception as e:
        return updated_data
    return updated_data


def update_tracker_by_parent_id(params, parent_tracker_id, update_values):
    """
    Update the tracker data by parent id
    """
    user = params.get('user')
    if (not user) or (not parent_tracker_id):
        return {}
    try:
        tracker_data = {}
        for key, val in update_values.items():
            tracker_data[key] = [val]
        print("update_tracker_by_parent_id - ", update_values)
        tracker_data['is_completed'] = tracker_data.get('is_completed', [0])
        tracker_data['is_drafted'] = tracker_data.get('is_drafted', [0])
        # tracker_data['is_cancelled'] = tracker_data.get('is_cancelled', [0])
        tracker_data.update({'updated_by': [user]})

        df = gramex.data.filter(
            url=staging_db_connection,
            query='''select id as tracker_id
                        from data_update_tracker where parent_id = :parent_id''',
            args={"parent_id": [parent_tracker_id]},
        )
        if not df.empty:
            child_data = df.to_dict("records") if df.to_dict("records") else []
            child_ids = [i.get('tracker_id') for i in child_data]
            tracker_data['id'] = child_ids
            gramex.data.update(
                staging_db_connection, table='data_update_tracker', args=tracker_data, id=['id']
            )

    except Exception as e:
        return False
    return True


def latest_data_update_track(handler):
    """
    Latest tracker data
    """
    latest_track = {}
    user = handler.session.get('user', {}).get('user')
    if not user:
        return latest_track
    track_df = gramex.data.filter(
        url=staging_db_connection,
        query='''select c.id as tracker_id, c.stage, c.status,
        CASE WHEN c.parent_id is not null then c.parent_id
        ELSE c.id END as parent_id,
        CASE WHEN JSON_VALUE(c.request_data,'$.dashboard_name') is not null then c.request_data
        ELSE p.request_data END as request_data,
        c.is_completed, c.is_drafted
        from data_update_tracker c
        left join data_update_tracker p on p.id = c.parent_id
        where c.is_completed = 0 and c.stage in ('fetch','merge','calculate','save','push') and c.is_drafted = 0 and c.is_cancelled = 0
        order by c.updated_at desc, c.id desc limit 1''',
    )
    if not track_df.empty:
        latest_track = track_df.to_dict("records")[0] if track_df.to_dict("records") else {}

    return latest_track


def get_fetch_status_track(handler):
    """
    return pending tracker data
    """
    track = {}
    user = handler.session.get('user', {}).get('user')
    args = handler.args
    tracker_id = args.get('tracker_id')[0] if args.get('tracker_id') else None
    if (not user) or (not tracker_id):
        return track
    track_df = gramex.data.filter(
        url=staging_db_connection,
        query='''select id as tracker_id, stage, status, request_data
                    from data_update_tracker
                    where id = :tracker_id and stage = 'fetch' and is_completed = 0 and is_cancelled = 0
                    order by updated_at desc, id desc limit 1''',
        args={"tracker_id": [tracker_id]},
    )
    if not track_df.empty:
        track = track_df.to_dict("records")[0] if track_df.to_dict("records") else {}

    return track


def data_updated_history(handler):
    """
    History data
    """
    api_data = {"total_count": 0, "data": []}
    args = handler.args
    tracks_history = {}
    user = handler.session.get('user', {}).get('user')
    offset = args.get('offset')[0] if args.get('offset') else 0
    order = args.get('order')[0] if args.get('order') else 'updated_at desc'
    limit = args.get('limit')[0] if args.get('limit') else 10
    if not user:
        return tracks_history

    # main query
    select_query = """ SELECT c.id as tracker_id,
        c.stage, c.status,
        CASE WHEN c.parent_id is not null then c.parent_id
        ELSE c.id END as parent_id,
        CONVERT_TZ(c.updated_at,'+00:00','+5:30') as updated_at,
        RANK() OVER (PARTITION BY COALESCE(c.parent_id, c.id)  ORDER BY c.id DESC, c.updated_at) as TRank,
        CASE WHEN JSON_VALUE(c.request_data,'$.dashboard_name') is not null then c.request_data
        ELSE p.request_data END as request_data,
        c.is_completed, c.is_drafted
        FROM data_update_tracker c
        LEFT JOIN data_update_tracker p on p.id = c.parent_id """
    filter_query = """ WHERE c.stage in ('fetch','save','push') and c.is_cancelled = 0"""
    orderby = """ ORDER BY c.{order}, c.id desc """
    limit_by = """ LIMIT {limit} OFFSET {offset} """
    query = (select_query + filter_query + orderby).format(
        **{"order": order}
    )
    query = """select * from ({}) as final_table where Trank = 1 LIMIT  {} offset {}""".format(query,limit,offset)
    track_df = gramex.data.filter(url=staging_db_connection, query=query)

    # count query
    count_query = (select_query + filter_query + orderby).format(**{"order": order})
    count_query = (
        """select count(*) as count from ({0}) as count_final_table where Trank = 1 """.format(
            count_query
        )
    )
    count_df = gramex.data.filter(url=staging_db_connection, query=count_query)

    # processing
    if not track_df.empty:
        data = track_df.to_dict("records") if track_df.to_dict("records") else []
        for i in data:
            req = i.get('request_data')
            req = json.loads(req)
            i.update({k: v[0] for k, v in req.items()})
        api_data['data'] = data

    if not count_df.empty:
        count_data = count_df.to_dict("records")[0] if count_df.to_dict("records") else {}
        api_data["total_count"] = count_data.get("count", 0)

    return api_data


def get_track_by_id(handler):
    """
    return tracker data by primary key id
    """
    track = {}
    user = handler.session.get('user', {}).get('user')
    args = handler.args
    tracker_id = args.get('tracker_id')[0] if args.get('tracker_id') else None
    if (not user) or (not tracker_id):
        return track
    track_df = gramex.data.filter(
        url=staging_db_connection,
        query='''SELECT c.id as tracker_id,
        c.stage, c.status,
        CASE WHEN c.parent_id is not null then c.parent_id
        ELSE c.id END as parent_id,
        CASE WHEN JSON_VALUE(c.request_data,'$.dashboard_name') is not null then c.request_data
        ELSE p.request_data END as request_data,
        CONVERT_TZ(c.updated_at,'+00:00','+5:30') as updated_at,
        c.is_completed, c.is_drafted
        FROM data_update_tracker c
        LEFT JOIN data_update_tracker p on p.id = c.parent_id
        WHERE c.id = :tracker_id ''',
        args={"tracker_id": [tracker_id]},
    )
    if not track_df.empty:
        track = track_df.to_dict("records")[0] if track_df.to_dict("records") else {}
    return track
