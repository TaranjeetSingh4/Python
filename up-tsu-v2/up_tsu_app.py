import os
import json
import gramex
import hashlib
import pandas as pd
from random import randint
from sqlalchemy import create_engine
from gramex.config import variables
from pyfcm import FCMNotification
import tornado
import re

directory = os.path.dirname(os.path.abspath(__file__))
connection_str = variables['connection_str']
engine = create_engine(connection_str)
con = engine.connect()
indicator_value = None
queries = gramex.cache.open('queries.yaml', 'yaml', rel=True)


def get_data(handler, query_function):
    arg = handler.args
    where_ = ""
    query = queries[query_function]
    if 'date' in arg:
        if (len(arg['date'])) > 1:
            if arg['date'][0] != "":
                from_date = arg['date'][1]
                to_date = arg['date'][0]
                where_ = "(f.date = '" + to_date + "')"
        else:
            if arg['date'][0] != "":
                date = arg['date'][0]
                where_ = "f.date = '" + date + "'"
        if 'indicator_id' in arg:
            if arg['indicator_id'][0] != '':
                if where_ != "":
                    where_ = where_ + " and "
                indicator_id = arg['indicator_id'][0]
                where_ = where_ + " f.indicator_id = '" + indicator_id + "'"
        if 'type' in arg:
            if arg['type'][0] != '':
                type_ = arg['type'][0]
                where_ = where_ + "type_ = '" + type_ + "'"
        if 'to_quarter' in arg:
            if arg['to_quarter'][0] != '' and arg['from_quarter'][0] != "":
                if where_ != "":
                    where_ = where_ + " and "
                quarter = arg['to_quarter'][0]
                from_quarter = arg['from_quarter'][0]
                if int(from_quarter) > int(quarter):
                    where_ = (
                        where_
                        + " quarter <= '"
                        + from_quarter
                        + "' and quarter >= '"
                        + quarter
                        + "' and "
                    )
                if int(from_quarter) < int(quarter):
                    where_ = (
                        where_
                        + " quarter >= '"
                        + from_quarter
                        + "' and quarter <= '"
                        + quarter
                        + "' and "
                    )
        if 'to_quarter' in arg:
            if arg['to_year'][0] != '' and arg['from_year'][0] != "":
                year = arg['to_year'][0]
                from_year = arg['from_year'][0]
                where_ = where_ + "year >= '" + from_year + "' and year <= '" + year + "'"
        if 'district' in arg:
            if arg['district'][0] != '':
                district = arg['district'][0]
                where_ = where_ + " and  LOWER(d.district_name) = '" + district.lower() + "'"
        if 'division' in arg:
            if arg['division'][0] != '':
                division = arg['division'][0]
                where_ = (
                    where_
                    + " and LOWER(TRIM(d.division_name)) = '"
                    + division.strip().lower()
                    + "'"
                )
        if where_ != "":
            where_ = "where " + where_
        agg_query = query.format(where=where_)
    else:
        if 'to_date' in arg:
            if arg['to_date'][0] != '' and arg['from_date'][0] != '':
                from_date = arg['from_date'][0]
                to_date = arg['to_date'][0]
                where_ = "(f.date >= '" + from_date + "' and f.date <= '" + to_date + "')"
            if arg['indicator_id'][0] != '':
                if where_ != "":
                    where_ = where_ + " and "
                indicator_id = arg['indicator_id'][0]
                where_ = where_ + "f.indicator_id = '" + indicator_id + "'"
            if arg['type'][0] != '':
                type_ = arg['type'][0]
                where_ = where_ + "type_ = '" + type_ + "' and "
            if arg['to_quarter'][0] != '' and arg['prev_quarter'][0] != "":
                if where_ != "":
                    where_ = where_ + " and "
                quarter = arg['to_quarter'][0]
                from_quarter = arg['prev_quarter'][0]
                if int(from_quarter) > int(quarter):
                    where_ = (
                        where_
                        + " quarter <= '"
                        + from_quarter
                        + "' and quarter >= '"
                        + quarter
                        + "' and "
                    )
                if int(from_quarter) < int(quarter):
                    where_ = (
                        where_
                        + " quarter >= '"
                        + from_quarter
                        + "' and quarter <= '"
                        + quarter
                        + "' and "
                    )
            if arg['to_year'][0] != '' and arg['prev_year'][0] != "":
                year = arg['to_year'][0]
                from_year = arg['prev_year'][0]
                where_ = where_ + "year >= '" + from_year + "' and year <= '" + year + "'"
            where_ = "where " + where_
            agg_query = query.format(where=where_)
        else:
            agg_query = query.format(where='')
    return agg_query


def overall_cal(data, handler):
    """
    Returns composite index by date, quarter, year.
    """
    arg = handler.args
    if len(data) == 0:
        return data
    data['date'] = data['date'].astype('str')
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            return (
                data.groupby(['date'], as_index=False)['composite_index']
                .mean()
                .groupby(['date'], as_index=False)
                .mean()
            )
        elif handler.get_query_arguments('to_quarter')[0] != "":
            return (
                data.groupby(['year', 'quarter'], as_index=False)['composite_index']
                .mean()
                .groupby(['quarter'], as_index=False)
                .mean()
            )
        else:
            return (
                data.groupby(['year'], as_index=False)['composite_index']
                .mean()
                .groupby(['year'], as_index=False)
                .mean()
            )
    else:
        if handler.get_query_arguments('to_date')[0] != "":
            return (
                data.groupby(['date'], as_index=False)['composite_index']
                .mean()
                .groupby(['date'], as_index=False)
                .mean()
            )
        elif handler.get_query_arguments('to_quarter')[0] != "":
            return (
                data.groupby(['year', 'quarter'], as_index=False)['composite_index']
                .mean()
                .groupby(['quarter'], as_index=False)
                .mean()
            )
        else:
            return (
                data.groupby(['year'], as_index=False)['composite_index']
                .mean()
                .groupby(['year'], as_index=False)
                .mean()
            )


def district_ranking(data, handler):
    data['date'] = data['date'].astype('str')
    data['composite_index'] = data['composite_index'].astype('int')
    data['composite_rank'] = data['composite_rank'].astype('int')
    return (
        data.groupby(['date', 'district', 'quarter', 'year'], as_index=False)[
            'composite_index', 'composite_rank'
        ]
        .mean()
        .sort_values('composite_index', ascending=False)
    )


def division_ranking(data, handler):
    data['date'] = data['date'].astype('str')
    data['composite_index'] = data['composite_index'].astype('int')
    data['composite_rank'] = data['composite_rank'].astype('int')
    return (
        data.groupby(['date', 'division', 'quarter', 'year'], as_index=False)[
            'composite_index', 'composite_rank'
        ]
        .mean()
        .sort_values('composite_index', ascending=False)
    )


def top_and_bottom_division(data, handler):
    """
    Returns data frame for division composite index of year, quarter, date.
    """
    arg = handler.args
    data = data.dropna()
    if len(data) == 0:
        return data
    data['date'] = data['date'].astype('str')
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            if len(data) == 0:
                return data
            return (
                data.groupby(['date', 'division', 'quarter', 'year'], as_index=False)[
                    'date', 'division', 'composite_index', 'year', 'quarter'
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
        elif handler.get_query_arguments('to_quarter')[0] != "":
            if len(data) == 0:
                return data
            return (
                data.groupby(['division', 'quarter', 'year'], as_index=False)['composite_index']
                .mean()
                .sort_values('composite_index', ascending=False)
            )
        else:
            if len(data) == 0:
                return data
            return (
                data.groupby(['division', 'year'], as_index=False)['composite_index']
                .mean()
                .sort_values('composite_index', ascending=False)
            )
    else:
        if handler.get_query_arguments('to_date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            if len(data) == 0:
                return data
            return (
                data.groupby(['date', 'division', 'quarter', 'year'], as_index=False)[
                    'date', 'division', 'composite_index', 'year', 'quarter'
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
        elif handler.get_query_arguments('to_quarter')[0] != "":
            if len(data) == 0:
                return data
            data['quarter'] = data['quarter'].astype('int')
            return (
                data.groupby(['date', 'division', 'quarter', 'year'], as_index=False)[
                    'composite_index'
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
        else:
            if len(data) == 0:
                return data
            return (
                data.groupby(['date', 'division', 'year'], as_index=False)['composite_index']
                .mean()
                .sort_values('composite_index', ascending=False)
            )


def stack_bar_summary(data, handler, type_):
    """
    Returns a dataframe with added column for percentage of stack bars.
    """

    # if type == 'type':
    if len(data) == 0:
        return data
    bla = type_ + "_index"
    bla1 = type_ + "_index_sum"
    bla2 = type_ + "_rank"
    type_ = "type_" if type_ == "type" else type_
    arg = handler.args
    data['date'] = data['date'].astype('str')
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            d1 = data.groupby(['date', type_], as_index=False)[bla, bla2, 'perc_point'].mean()
            d2 = d1.groupby('date', as_index=False)[bla].agg({bla1: 'sum'})
        elif handler.get_query_arguments('to_quarter')[0] != "":
            d1 = data.groupby(['quarter', type_], as_index=False)[bla, bla2, 'perc_point'].mean()
            d2 = d1.groupby('quarter', as_index=False)[bla].agg({bla1: 'sum'})
        else:
            d1 = data.groupby(['year', type_], as_index=False)[bla, bla2, 'perc_point'].mean()
            d2 = d1.groupby('year', as_index=False)[bla].agg({bla1: 'sum'})
    else:
        if handler.get_query_arguments('to_date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            d1 = data.groupby(['date', type_, 'indicator'], as_index=False)[
                bla, bla2, 'perc_point'
            ].mean()
            d2 = d1.groupby('date', as_index=False)[bla].agg({bla1: 'sum'})
        elif handler.get_query_arguments('to_quarter')[0] != "":
            d1 = data.groupby(['quarter', type_, 'indicator'], as_index=False)[
                bla, bla2, 'perc_point'
            ].mean()
            d2 = d1.groupby('quarter', as_index=False)[bla].agg({bla1: 'sum'})
        else:
            d1 = data.groupby(['year', type_, 'indicator'], as_index=False)[
                bla, bla2, 'perc_point'
            ].mean()
            d2 = d1.groupby('year', as_index=False)[bla].agg({bla1: 'sum'})
    data = pd.merge(d2, d1, how='right')
    data['stack_bar_data'] = (data[bla] / data[bla1]) * 100
    del data[bla1]
    return data.fillna(0)


def _stack_bar(data, handler, domain_type, d_t_index):
    """
    Returns a dataframe with added column for percentage of stack bars for overall
    state.
    """
    arg = handler.args
    if len(data) == 0:
        return data
    data['date'] = data['date'].astype('str')
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            d1 = data.groupby(['date', domain_type, 'quarter', 'year'], as_index=False)[
                d_t_index, 'perc_point'
            ].mean()
            d2 = d1.groupby(['date'], as_index=False)[d_t_index].agg({d_t_index + '_sum': 'sum'})
        elif handler.get_query_arguments('to_quarter')[0] != "":
            d1 = data.groupby([domain_type, 'quarter', 'year'], as_index=False)[
                d_t_index, 'perc_point'
            ].mean()
            d2 = d1.groupby(['quarter'], as_index=False)[d_t_index].agg(
                {d_t_index + '_sum': 'sum'}
            )
        else:
            d1 = data.groupby([domain_type, 'year'], as_index=False)[
                d_t_index, 'perc_point'
            ].mean()
            d2 = d1.groupby(['year'], as_index=False)[d_t_index].agg({d_t_index + '_sum': 'sum'})
        data = pd.merge(d2, d1, how='right')
        data['stack_bar'] = data[d_t_index] / data[d_t_index + '_sum'] * 100
        del data[d_t_index + '_sum']
    else:
        if handler.get_query_arguments('to_date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            d1 = data.groupby(['date', 'type_', 'quarter', 'year', 'indicator'], as_index=False)[
                'type_index', 'perc_point'
            ].mean()
            d2 = d1.groupby(['date'], as_index=False)['type_index'].agg({'type_index_sum': 'sum'})
        if handler.get_query_arguments('to_quarter')[0] != "":
            d1 = data.groupby(['type_', 'quarter', 'year', 'indicator'], as_index=False)[
                'type_index', 'perc_point'
            ].mean()
            d2 = d1.groupby(['quarter'], as_index=False)['type_index'].agg(
                {'type_index_sum': 'sum'}
            )
        else:
            d1 = data.groupby(['type_', 'year', 'indicator'], as_index=False)[
                'type_index', 'perc_point'
            ].mean()
            d2 = d1.groupby(['year'], as_index=False)['type_index'].agg({'type_index_sum': 'sum'})
        data = pd.merge(d2, d1, how='right')
        data['stack_bar'] = (data['type_index'] / data['type_index_sum']) * 100
        del data['type_index_sum']
    return data.fillna(0)


def stack_bar_overall(data, handler):
    """
    Returns a dataframe with added column for percentage of stack bars for overall
    state.
    """
    return _stack_bar(data, handler, 'type_', 'type_index')


def stack_bar_overall1(data, handler):
    """
    Returns a dataframe with added column for percentage of stack bars for overall
    state.
    """
    return _stack_bar(data, handler, 'domain', 'domain_index')


def top_and_bottom_block(data, handler):
    """
    Returns data frame calculating mean of date map_id
    composite_index, composite_rank, indicator_index, type_index, domain_index
    for districts.
    """
    arg = handler.args
    data = data.dropna()
    if len(data) == 0:
        return data
    top_bottom = pd.DataFrame()
    data['date'] = data['date'].astype('str')
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            for date in data.date.unique():
                d_ = data[data['date'] == date]
                d_ = (
                    d_.groupby(['date', 'district', 'block', 'map_id'], as_index=False)[
                        'composite_index', 'indicator_index', 'type_index', 'domain_index'
                    ]
                    .mean()
                    .sort_values(by='composite_index', ascending=False)
                )
                d_['composite_rank'] = d_.composite_index.rank(method='dense', ascending=False)
                top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(['quarter', 'district', 'block', 'map_id'], as_index=False)[
                    'composite_index', 'indicator_index', 'type_index', 'domain_index'
                ]
                .mean()
                .sort_values(by='composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(['year', 'district', 'block', 'map_id'], as_index=False)[
                    'composite_index', 'indicator_index', 'type_index', 'domain_index'
                ]
                .mean()
                .sort_values(by='composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
    else:
        if (
            handler.get_query_arguments('to_date')[0] != ""
            and handler.get_query_arguments('from_date')[0] != ""
        ):
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            for date in data.date.unique():
                d_ = data[data['date'] == date]
                d_ = (
                    d_.groupby(
                        ['date', 'district', 'block', 'map_id', 'indicator'], as_index=False
                    )[
                        'composite_index',
                        'indicator_index',
                        'type_index',
                        'domain_index',
                        'perc_point',
                        'div_map_id',
                    ]
                    .mean()
                    .sort_values(by='composite_index', ascending=False)
                )
                d_['composite_rank'] = d_.composite_index.rank(method='dense', ascending=False)
                top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(
                    ['quarter', 'district', 'block', 'map_id', 'indicator'], as_index=False
                )[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values(by='composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(['year', 'district', 'block', 'map_id', 'indicator'], as_index=False)[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values(by='composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
    return top_bottom


def top_and_bottom_block_division(data, handler, type_):
    """
    Returns data frame calculating mean of date map_id
    composite_index by year, quarter for divisions.
    """
    arg = handler.args
    data = data.dropna()
    if len(data) == 0:
        return data
    data['date'] = data['date'].astype('str')
    type_ = "type_" if type else type_
    top_bottom = pd.DataFrame()
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            for date in data.date.unique():
                d_ = data[data['date'] == date]
                if 'rank' in arg:
                    d_ = (
                        d_.groupby(['date', 'div_map_id', 'district', 'division'], as_index=False)[
                            'composite_index',
                            'indicator_index',
                            'type_index',
                            'domain_index',
                            'composite_rank',
                        ]
                        .mean()
                        .sort_values('composite_index', ascending=False)
                    )
                else:
                    d_ = (
                        d_.groupby(['date', 'div_map_id', 'division'], as_index=False)[
                            'composite_index',
                            'indicator_index',
                            'type_index',
                            'domain_index',
                            'composite_rank',
                        ]
                        .mean()
                        .sort_values('composite_index', ascending=False)
                    )
                d_['composite_rank'] = d_.composite_index.rank(method='dense', ascending=False)
                top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(['quarter', 'div_map_id', 'division'], as_index=False)[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'composite_rank',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(['year', 'div_map_id', 'division'], as_index=False)[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'composite_rank',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
    else:
        if (
            handler.get_query_arguments('to_date')[0] != ""
            and handler.get_query_arguments('from_date')[0] != ""
        ):
            # data = data[data['date'] == handler.get_query_arguments('date')[0]]
            for date in data.date.unique():
                d_ = data[data['date'] == date]
                d_ = (
                    d_.groupby(
                        ['date', type_, 'div_map_id', 'indicator', 'division'], as_index=False
                    )[
                        'composite_index',
                        'indicator_index',
                        'type_index',
                        'domain_index',
                        'perc_point',
                        'div_map_id',
                    ]
                    .mean()
                    .sort_values('composite_index', ascending=False)
                )
                d_['composite_rank'] = d_.composite_index.rank(method='dense', ascending=False)
                top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(
                    ['date', 'quarter', type_, 'div_map_id', 'indicator', 'division'],
                    as_index=False,
                )[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(
                    ['date', 'year', type_, 'div_map_id', 'indicator', 'division'], as_index=False
                )[
                    'composite_index',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            data['composite_rank'] = data.composite_index.rank(method='dense', ascending=False)
            top_bottom = top_bottom.append(data)
    return top_bottom


def top_and_bottom_district(data, handler):
    """
    Returns data frame calculating mean of date map_id
    composite_index by year, quarter for districts.
    """
    arg = handler.args
    # data = data.dropna()
    if len(data) == 0:
        return data
    data['date'] = data['date'].astype('str')
    top_bottom = pd.DataFrame()
    if 'date' in arg:
        if handler.get_query_arguments('date')[0] != "":
            for date in data.date.unique():
                # d_ = data[data['date'] == date]
                d_ = data
                d_ = (
                    d_.groupby(['date', 'district', 'map_id'], as_index=False)[
                        'composite_index',
                        'composite_rank',
                        'indicator_index',
                        'type_index',
                        'domain_index',
                    ]
                    .mean()
                    .sort_values('composite_index', ascending=False)
                )
                top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(['quarter', 'district', 'map_id'], as_index=False)[
                    'composite_index',
                    'composite_rank',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(['year', 'district', 'map_id'], as_index=False)[
                    'composite_index',
                    'composite_rank',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            top_bottom = top_bottom.append(data)
    else:
        if (
            handler.get_query_arguments('to_date')[0] != ""
            and handler.get_query_arguments('from_date')[0] != ""
        ):
            # for date in data.date.unique():
            # d_ = data[data['date'] == date]
            d_ = data
            d_ = (
                d_.groupby(['date', 'district', 'map_id', 'indicator'], as_index=False)[
                    'composite_index',
                    'composite_rank',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            top_bottom = top_bottom.append(d_)
        elif handler.get_query_arguments('to_quarter')[0] != "":
            data = (
                data.groupby(
                    ['date', 'quarter', 'district', 'map_id', 'indicator'], as_index=False
                )[
                    'composite_index',
                    'composite_rank',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            top_bottom = top_bottom.append(data)
        else:
            data = (
                data.groupby(['date', 'year', 'district', 'map_id', 'indicator'], as_index=False)[
                    'composite_index',
                    'composite_rank',
                    'indicator_index',
                    'type_index',
                    'domain_index',
                    'perc_point',
                    'div_map_id',
                ]
                .mean()
                .sort_values('composite_index', ascending=False)
            )
            top_bottom = top_bottom.append(data)
    return top_bottom


def get_version(handler):
    """Return current version of the app"""
    version = 1.6
    return json.dumps({'version': version})


def random_with_n_digits(n):
    """Generate random number for OTP."""
    range_start = 10 ** (n - 1)
    range_end = (10**n) - 1
    return randint(range_start, range_end)  # nosec B311


def send_otp(handler):
    """Send OTP to user's phone number."""
    otp = random_with_n_digits(5)
    phonenumber = handler.get_argument('phone_number', '')
    pattern = re.compile("[0-9]{10}$")
    if pattern.match(phonenumber):
        query = "select * from user_details where phonenumber='{phonenumber}'"
        df = gramex.data.filter(
            connection_str, table='user_details', query=query, args={"phonenumber": [phonenumber]}
        )
        user_name = df['user'].values.tolist()[0]
        if len(user_name) == 0:
            return "fail"
        otp_message = "Your OTP is {} to reset password for ".format(otp)
        otp_message = (
            otp_message
            + "user \
            {} on Uttar Pradesh Health Dashboard.".format(
                user_name
            )
        )
        gramex.service.sms['exotel'].send(to=phonenumber, subject=otp_message, sender='UPHEAL')
        handler.args['otp'] = [otp]
        gramex.data.update(
            connection_str, table='user_details', id=['phonenumber'], args=handler.args
        )
        return "success"
    else:
        return ""


def block_view(data, handler):
    """
    Returns data frame calculating mean of indicator index by composite, indicator, type
    and domain index with map_id and composite_rank at block level.
    """

    if len(handler.get_arguments('date')) != 0:
        return data.groupby(['date', 'block'], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'count',
            'perc_point',
        ].mean()
    elif len(handler.get_arguments('quarter')) != 0:
        if handler.get_query_arguments('quarter')[0] == "1":
            df1 = data[
                (data['year'] == int(handler.get_query_arguments('year')[0]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[0]))
            ]
            df2 = data[
                (data['year'] == int(handler.get_query_arguments('year')[1]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[1]))
            ]
            data = df1.append(df2)
        return data.groupby(['quarter', 'block'], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'count',
            'perc_point',
        ].mean()
    else:
        return data.groupby(['year', 'block'], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'count',
            'perc_point',
        ].mean()


def district_view(data, handler, type_):
    """
    Returns data frame calculating mean of indicator index by composite, indicator, type
    and domain index with map_id and composite_rank at district level.
    """

    if len(handler.get_arguments('date')) != 0:
        return data.groupby(['date', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'perc_point',
        ].mean()
    elif len(handler.get_arguments('quarter')) != 0:
        if handler.get_query_arguments('quarter')[0] == "1":
            df1 = data[
                (data['year'] == int(handler.get_query_arguments('year')[0]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[0]))
            ]
            df2 = data[
                (data['year'] == int(handler.get_query_arguments('year')[1]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[1]))
            ]
            data = df1.append(df2)
        return data.groupby(['quarter', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'perc_point',
        ].mean()
    else:
        return data.groupby(['year', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'perc_point',
        ].mean()


def division_view(data, handler, type_):
    """
    Returns data frame calculating mean of indicator index by composite, indicator, type
    and domain index with map_id and composite_rank at division level.
    """

    if len(handler.get_arguments('date')) != 0:
        data = data.groupby(['date', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'div_map_id',
            'perc_point',
        ].mean()
    elif len(handler.get_arguments('quarter')) != 0:
        if handler.get_query_arguments('quarter')[0] == "1":
            df1 = data[
                (data['year'] == int(handler.get_query_arguments('year')[0]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[0]))
            ]
            df2 = data[
                (data['year'] == int(handler.get_query_arguments('year')[1]))
                & (data['quarter'] == int(handler.get_query_arguments('quarter')[1]))
            ]
            data = df1.append(df2)
        data = data.groupby(['quarter', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'div_map_id',
            'perc_point',
        ].mean()
    else:
        data = data.groupby(['year', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'div_map_id',
            'perc_point',
        ].mean()
    return data.rename(columns={'div_map_id': 'map_id'}).fillna(0)


def context_data_division(data, handler):
    data['composite_rank'] = data.groupby(['indicator', 'date'])['composite_index'].rank(
        ascending=False
    )
    data['indicator_rank'] = data.groupby(['indicator', 'date'])['indicator_index'].rank(
        ascending=False
    )
    # data['domain_rank'] = data.groupby('indicator')['domain_index'].rank(ascending=False)
    # data['type_rank'] = data.groupby('indicator')['type_index'].rank(ascending=False)

    # import pdb; pdb.set_trace();
    area_id = handler.get_argument('division_id', None)
    if area_id:
        data = data[data['division_id_num'] == int(area_id)]
    # data = data.query('division_id_num == @area_id')

    return data


def context_data(data, handler):

    if len(handler.get_arguments('date')) == 1:
        date = handler.get_arguments('date')
        data = data[(data['date'] == date[0])]
    elif len(handler.get_arguments('date')) == 2:
        date = handler.get_arguments('date')
        data = data[(data['date'] == date[0]) | (data['date'] == date[1])]
    data = data.groupby(['date', 'indicator'], as_index=False).mean()
    data['composite_rank'] = data.groupby('indicator')['composite_index'].rank(ascending=False)
    data['indicator_rank'] = data.groupby('indicator')['indicator_index'].rank(ascending=False)
    data['domain_rank'] = data.groupby('indicator')['domain_index'].rank(ascending=False)
    data['type_rank'] = data.groupby('indicator')['type_index'].rank(ascending=False)
    return data


def get_last_update(data):
    return pd.DataFrame.from_dict(
        {'last_date': pd.to_datetime(data['date']).max().strftime('%Y-%m-%d')}, orient='index'
    )


def get_config(handler):
    """Return config defined in handler."""
    return json.dumps(handler.kwargs.config)


def push_notification(handler):
    # This registration token comes from the client FCM SDKs.
    push_service = FCMNotification(api_key="AIzaSyDsrNohl_qfZa72G5UkCm88muDmTbYgykQ")
    sql_stmt = "select * from user_tokens"
    data = call_sql(sql_stmt, 'select')
    # Send to multiple devices by passing a list of ids.
    registration_ids = data.token.tolist()
    message_title = "UPTSU Updated version to {0}".format(
        json.loads(get_version(handler))['version']
    )
    message_body = handler.get_argument('msg', '')
    result = push_service.notify_multiple_devices(
        registration_ids=registration_ids, message_title=message_title, message_body=message_body
    )
    return json.dumps({'result': result})


def connect_db():
    """Connect to MySQL DB."""
    engine = create_engine(connection_str)
    return engine


def call_sql(query, type):
    """Get query optimization."""
    conn = connect_db()
    # conn = global_engine.connect()
    data = 0
    if type == 'select':
        data = pd.read_sql(query, conn)
    elif type == 'upsert':
        conn.execute(query)
    # conn.close()
    conn.dispose()
    return data


@tornado.gen.coroutine
def push_notification1(handler):
    """Validate ANM code."""
    token = handler.get_argument('token', '')
    sql_stmt = "insert into user_tokens (token) values ('{token}')"
    sql_stmt = sql_stmt.format(token=token)
    call_sql(sql_stmt, 'upsert')
    return json.dumps({'msg': 'Token id stored Successfully'})


def active_session(handler):
    session = handler.session
    if 'user' in session.keys():
        return 'true'
    return 'false'


def hash_str(handler):
    salt = 'uphealth'
    string = handler.get_argument('str')
    hashed = hashlib.sha256(string.encode() + salt.encode()).hexdigest()
    return json.dumps({'hashed': hashed})


def max_date_args(args, handler):
    date = handler.get_argument('date', None)
    if not date:
        date = pd.read_sql(
            'SELECT max(date) as date FROM fact_cmo_district_data_monthly', connection_str
        )
        if len(date) > 0:
            date = pd.to_datetime(date.iloc[0]['date']).strftime('%Y-%m-%d')
            args.update({'date': [date]})


def district_query(args):
    query = """select t1.district_id_num as id, t1.district_name as name,
                t1.indicator_name as ind_name, t2.perc_point, t1.indicator_id, t1.weight
                from dim_cmo_district_data as t1
                left join fact_cmo_district_data_monthly t2
                on t1.district_id_num = t2.district_id_num and t1.indicator_id = t2.indicator_id
                and t2.date='{date}' and t1.district_id_num = {district_id}
            """
    # district_names =  args.get('category', [None])
    global indicator_value
    indicator_value = args.get('indicator_value', [None])[0]
    # import pdb;
    # pdb.set_trace();
    format_value = ""
    if indicator_value:
        format_value = "where trim(t1.category) = '{indicator_value}'".format(
            indicator_value=indicator_value
        )
    query = query + format_value
    return query


def pivot_function_cmo(data, index, column, value_column):
    data = pd.pivot_table(data, values=value_column, index=index, columns=column, aggfunc='sum')
    data = data.reset_index()
    # import pdb
    # pdb.set_trace();
    return data


def get_cmo_indicator_filter_data(data, handler):
    indicator_ids = list(data['indicator_id'].unique())
    # district_ids = list(data['id'].unique())
    rank_df = pd.DataFrame()
    # sum_df = pd.DataFrame()
    for ind in indicator_ids:
        rank_data = data.query('indicator_id == @ind')
        # print(rank_data['perc_point'].max(), ind)
        rank_data.loc[:, 'rank_value'] = (rank_data['perc_point'] * rank_data['weight']) / (
            rank_data['perc_point'].max() * rank_data['weight']
        )
        #     data.loc[:,'rank_sum'] = data['rank_value'].sum()
        rank_df = rank_df.append(rank_data)

    sum_df = rank_df.groupby(['id'])['rank_value'].sum().reset_index()
    sum_df.rename(columns={'rank_value': 'rank_sum'}, inplace=True)
    # sum_df
    sum_df = sum_df.merge(rank_df, on=['id'], how="left")

    sum_df['rank'] = sum_df.groupby(['indicator_id'])['rank_sum'].rank(
        method='dense', ascending=False
    )
    sum_df.fillna('NA', inplace=True)

    data = sum_df

    data = pivot_function_cmo(data, ['id', 'rank', 'name'], ['ind_name'], 'perc_point')
    if not indicator_value:
        data = data[variables['pivot_cols']]
    return data


def get_cmo_sub_indicator_filter_data(data, handler):
    return pivot_function_cmo(data, ['id', 'ind_id', 'filter_id'], ['sub_name'], 'value')


def download_cmo_data(data, handler):
    main_data = data['main_data']
    sub_data = data['sub_data']
    mer_data = pd.merge(main_data, sub_data, on=['id', 'indicator_id'], how='left')
    mer_data.rename(columns={'Communicable disease': 'TB Notification'}, inplace=True)
    mer_data.fillna('NA', inplace=True)
    sub_ind_name = variables['sub_ind_col_names']
    mer_data['sub_short_name'] = mer_data['sub_name'].apply(lambda x: sub_ind_name[x])
    mer_data.drop(['id'], axis=1, inplace=True)
    data_filter = {}
    end_num = 29
    for k, v in mer_data.groupby('ind_name'):
        data_filter[k[0:end_num]] = v.round(2)

    return data_filter


def analytics_accordion_month_block(args, _query):
    query = queries[_query]

    view = args.get('view', [None])[0]
    format_value = ""
    if view == 'geo':
        date = args.get('date', [None])[0]
        # format_value = """ where (t1.date= '{date}') group by t1.date, t2.block_name,
        #   t2.type_name""".format(date=date)
        format_value = """ where (t1.date= '{date}')""".format(date=date)
    else:
        from_date = args.get('from_date', [None])[0]
        to_date = args.get('to_date', [None])[0]
        # format_value = """ where (t1.date='{from_date}' or t1.date='{to_date}') group by t1.date,
        #   t2.block_name, t2.type_name""".format(from_date=from_date, to_date=to_date)
        format_value = """ where (t1.date='{from_date}' or t1.date='{to_date}')""".format(
            from_date=from_date, to_date=to_date
        )

    # query = query + format_value
    query = query.format(where_clause=format_value)

    return query


def analytics_accordion_quarter_block(args, _query):
    query = queries[_query]

    view = args.get('view', [None])[0]
    format_value = ""
    if view == 'geo':
        date = args.get('date', [None])[0]
        # format_value = """ where (t1.date= '{date}') group by t1.date, t2.block_name,
        #   t2.type_name""".format(date=date)
        format_value = " where (t1.date= '{date}')".format(date=date)
    else:
        from_value = args.get('from_value', [None])[0]
        to_value = args.get('to_value', [None])[0]

        from_year = args.get('from_year', [None])[0]
        to_year = args.get('to_year', [None])[0]

        format_value = """ where (t1.quarter={from_value} or t1.quarter={to_value})
                            and (t1.year={from_year} or t1.year={to_year})""".format(
            from_value=from_value, to_value=to_value, from_year=from_year, to_year=to_year
        )

    query = query.format(where_clause=format_value)

    return query


def error_fn(status, kwargs, handler):
    # import pdb
    # pdb.set_trace()
    """Load the error pages as required"""
    error_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'errorpage.html')
    tmpl = gramex.cache.open(error_path, 'template')
    handler.set_status(status)
    return tmpl.generate(kwargs=kwargs, status=status, handler=handler)


def analytics_accordion_year_block(args, _query):
    query = queries[_query]

    view = args.get('view', [None])[0]
    format_value = ""
    if view == 'geo':
        date = args.get('date', [None])[0]
        # format_value = """ where (t1.date= '{date}') group by t1.date, t2.block_name,
        #   t2.type_name""".format(date=date)
        format_value = " where (t1.date= '{date}')".format(date=date)
    else:
        from_year = args.get('from_year', [None])[0]
        to_year = args.get('to_year', [None])[0]

        format_value = " where (t1.year={from_year} or t1.year={to_year})".format(
            from_year=from_year, to_year=to_year
        )

    query = query.format(where_clause=format_value)

    return query


def prepare_store_logs(handler):
    # breakpoint()
    data = handler.args
    data['ip'] = [handler.request.remote_ip]
    data['username'] = [handler.session.get("user")['user']]
    # log_details = {
    #     'url': data['url'][0],
    #     'screen': data['screen'][0],
    #     'application': data['application'][0],
    #     'ip': handler.request.remote_ip,
    #     'username': handler.session.get("user")['user']
    # }
    gramex.data.insert(url=connection_str, table="logs", id=["id"], args=data)
    # breakpoint()
    # data = json.loads(args["data"][0])[0]
    return json.dumps({"result": "success"})


def cm_indicators_data(handler):
    api_data = []
    query = """ SELECT ROUND(avg(t1.perc_point),2) as value, DATE_FORMAT(t1.date,'%%b %%Y') as date,
          t1.indicator_id ,t2.indicator_name AS indicator
          FROM fact_cm_district_data_monthly t1
          LEFT JOIN dim_cm_district_data t2 ON t2.district_id_num = t1.district_id_num
          AND t1.indicator_id = t2.indicator_id
          where date = ( SELECT max(date) as date FROM fact_cm_district_data_monthly)
          group by DATE_FORMAT(t1.date,'%%b-%%Y'), t1.indicator_id ,t2.indicator_name
        """
    indicators_data = pd.read_sql(query, connection_str)
    if not indicators_data.empty:
        api_data = indicators_data.to_dict("records") if indicators_data.to_dict("records") else []
    return json.dumps(api_data)


def get_list_of_files(handler):
    _path = 'data_pdf/'
    _files = [f for f in os.listdir(os.path.join(directory, _path)) if not f.startswith('.')]
    return json.dumps(_files)


def download_pdf(handler):
    args = handler.argparse('filename')
    handler.set_header('Content-Type', 'application/pdf')
    handler.set_header('Content-Disposition', 'attachment; filename=' + args.filename)
    return open(os.path.join(directory, 'data_pdf', args.filename), 'rb').read()


def delete_pdf(handler):
    args = handler.argparse('filename')
    os.remove(os.path.join(directory, 'data_pdf', args.filename))
