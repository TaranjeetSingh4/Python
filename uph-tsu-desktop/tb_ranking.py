import gramex
from gramex.config import variables


queries = gramex.cache.open('queries.yaml', 'yaml', rel=True)
connection_string = variables['connection_string']


def _queries(args, status):
    _args = dict()
    query_param = args['query_param'] if 'query_param' in args else args
    for k, v in query_param.items():
        _args[k] = v[0]
    if 'query_param' in args:
        del args['query_param']
    return queries[status].format(**_args)


def get_prev_qtr(qtr, year, quar_type):
    """
    Get the previous or next quarter for the given quarter and year for tb_ranking
    quarter and year format
    :param qtr: Q1,Q2,Q3,Q4
    :param year: any year value
    :return: previous or next quarter and year
    """
    qtr = int(qtr.lower().replace('q', ''))
    prev_qtr = qtr - 1 if quar_type == 'prev' else qtr + 1
    prev_year = int(year)
    if prev_qtr == 0:
        prev_qtr = "Q4"
        prev_year -= 1
    else:
        prev_qtr = "Q{}".format(prev_qtr)
    return prev_qtr, prev_year


def get_table_query(args, query_id, date_range):
    """
    Creates the query to pull previous 3 quarters data
    :param args:
    :param query_id:
    :return:
    """
    _args = dict()
    query_param = args['query_param'] if 'query_param' in args else args
    for k, v in query_param.items():
        _args[k] = v[0]
    qtr, yr = _args['quarter'], _args['year']
    lst = [(qtr, yr)]
    if 'query_param' in args:
        del args['query_param']
    for i in range(0, date_range):
        qtr, yr = get_prev_qtr(qtr, yr, 'prev')
        lst.append((qtr, yr))
    fin_tup = tuple(lst)
    _args['qtr_yr'] = fin_tup
    return queries[query_id].format(**_args)


def group_table_data(data_df, group_list, year, quarter):
    dict_lst = []
    previous = []
    change = 0
    if data_df.score.isnull().all():
        return dict_lst
    df_agg = data_df
    df_agg['rank'] = data_df.groupby(['quarter', 'year'])['score'].rank(
        ascending=0, method='dense'
    )
    grouped = df_agg.groupby(group_list)
    dict_lst = []
    for k, group in grouped:
        g = group.copy()
        findic = {}
        prsnt_data = g[g['quarter'].isin([quarter]) & g['year'].isin([year])]
        prev_data = get_prev_qtr(quarter, year, 'prev')
        previous = g[g['quarter'].isin([prev_data[0]]) & g['year'].isin([prev_data[1]])]
        prsnt_data.fillna(0, inplace=True)
        previous.fillna(0, inplace=True)
        findic['score'] = 0 if prsnt_data.empty else prsnt_data.iloc[0]['score']
        findic['end'] = 0 if previous.empty else previous.iloc[0]['score']
        if findic['end'] != 0:
            change = (findic['score'] - findic['end']) / findic['end']
        else:
            change = 0
        findic['date'] = quarter + "'" + "{}".format(year)[2:]
        findic['change'] = change
        # g.sort_values(by=['year', 'quarter'], ascending=True, inplace=True)
        # g['start'] = g['score'].pct_change(periods=1)
        # g.sort_values(by=['year', 'quarter'], ascending=False, inplace=True)
        # g['end'] = g['score'].pct_change(periods=1)
        findic['state_id'] = k[0]
        findic['state'] = k[1]
        # g['date'] = g.apply(lambda x: x['quarter'] + "'" + "{}".format(x['year'])[2:], axis=1)
        # findic['timeseries'] = g.to_dict(orient='records')
        # findic['timeseries'] = sorted(findic['timeseries'],
        #                               key=lambda i: (i['year'], i['quarter']))
        dict_lst.append(findic)
    return dict_lst


def _sort_n_rank(data_df):
    data_df = data_df.reset_index(drop=True)
    data_df['rank'] = data_df.index + 1
    return data_df


def round_data(data_df, handler):
    result = {}
    data_df = data_df.round(2)
    if '_download' in handler.args.keys():
        result[handler.args['filename'][0]] = data_df
        return result
    return data_df


def group_matrix_data(data_df, group_list, year):
    df_agg = data_df
    df_agg.fillna(0, inplace=True)
    df_agg['rank'] = data_df.groupby(['quarter', 'year'])['score'].rank(
        ascending=0, method='dense'
    )
    grouped = df_agg.groupby(['quarter', 'year'])
    result_map = {}
    yr_grouped = df_agg.groupby(group_list)
    yr_gpd_df = yr_grouped.mean().reset_index()
    yr_gpd_df.insert(2, "quarter", "Q")
    # result_map["year avg."] = yr_gpd_df.to_dict(orient='records')
    result_map['year'] = year
    for k, group in grouped:
        g = group.copy()
        dict_key = k[0]
        result_map[dict_key] = g.to_dict(orient='records')
    return result_map
