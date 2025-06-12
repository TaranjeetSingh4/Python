#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import json
import time
import gramex
import hashlib
import datetime
import gramex.cache
import pandas as pd
import numpy as np
import re
from gramex.config import variables

# from pandas.io.pytables import Table
from tornado.web import HTTPError
from gramex.http import BAD_REQUEST
from gramex import service
from sqlalchemy import create_engine
import requests

# libs for captcha
from glob2 import glob
import base64
import string
import random
from captcha.image import ImageCaptcha
import secrets


directory = os.path.dirname(os.path.abspath(__file__))
connection_str = variables['connection_str']
engine = create_engine(connection_str)
con = engine.connect()
connection_str_sqlite = variables['connection_str_sqlite']
currdir = os.path.abspath(os.path.dirname(__file__))
normalize_amethi = 75
indicator_value = None


def stack_bar_summary(data, handler, type_, filters=''):
    """
    Returns a dataframe with added column for percentage of stack bars.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    type_index = type_ + '_index'
    type_rank = type_ + '_rank'
    type_index_sum = type_ + '_index_sum'
    if len(handler.get_arguments('date')) != 0:
        d1 = data.groupby(['date', type_], as_index=False)[type_index, type_rank].mean()
        d2 = d1.groupby('date', as_index=False)[type_index].agg({type_index_sum: 'sum'})
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
        d1 = data.groupby(['quarter', type_], as_index=False)[type_index, type_rank].mean()
        d2 = d1.groupby('quarter', as_index=False)[type_index].agg({type_index_sum: 'sum'})
    else:
        d1 = data.groupby(['year', type_], as_index=False)[type_index, type_rank].mean()
        d2 = d1.groupby('year', as_index=False)[type_index].agg({type_index_sum: 'sum'})
    data = pd.merge(d2, d1, how='right')
    data['stack_bar_data'] = data[type_index] / data[type_index_sum] * 100
    del data[type_index_sum]
    return data.fillna(0)


def overall(data, handler, filters=''):
    """
    Returns data frame calculating mean of composite index by date, quater, year.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    if len(handler.get_arguments('date')) != 0:
        return (
            data.groupby(['date'], as_index=False)['composite_index', 'perc_point']
            .mean()
            .groupby(['date'], as_index=False)
            .mean()
        )
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
        return (
            data.groupby(['quarter', 'year'], as_index=False)['composite_index', 'perc_point']
            .mean()
            .groupby(['quarter'], as_index=False)
            .mean()
        )
    else:
        return (
            data.groupby(['year'], as_index=False)['composite_index', 'perc_point']
            .mean()
            .groupby(['year'], as_index=False)
            .mean()
        )


def overall_indicators(data, handler, filters=''):
    """
    Returns data frame calculating mean of indicator index by date, quater, year.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    if len(handler.get_arguments('date')) != 0:
        if filters == 'amethi':
            data = (
                data.groupby(['date', 'indicator_id', 'indicator', 'Weight'], as_index=False)[
                    'indicator_index', 'perc_point'
                ]
                .mean()
                .fillna(0)
            )
            data['weightage'] = data['indicator_index'] / data['Weight'] * 100
            return data
        else:
            return (
                data.groupby(['date', 'indicator_id', 'indicator'], as_index=False)[
                    'indicator_index', 'perc_point'
                ]
                .mean()
                .fillna(0)
            )
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
        return (
            data.groupby(['quarter', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )
    else:
        return (
            data.groupby(['year', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )


def indicators_by_type(data, handler, filters=''):
    """
    Returns data frame calculating mean of indicator index by date, quater, year.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    if len(handler.get_arguments('date')) != 0:
        if filters == 'amethi':
            data = (
                data.groupby(
                    ['date', 'type', 'indicator_id', 'indicator', 'Weight'], as_index=False
                )['indicator_index', 'perc_point']
                .mean()
                .fillna(0)
            )
            data['weightage'] = data['indicator_index'] / data['Weight'] * 100
            return data
        else:
            return (
                data.groupby(['date', 'type', 'indicator_id', 'indicator'], as_index=False)[
                    'indicator_index', 'perc_point'
                ]
                .mean()
                .fillna(0)
            )
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
        return (
            data.groupby(['type', 'quarter', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )
    else:
        return (
            data.groupby(['type', 'year', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )


# download for both niti and cmo and amethi
def download_niti_data(data, handler):
    area = handler.get_argument('area')
    table = handler.get_argument('url_file')
    negative_ind = []  # no negative indicators for niti
    print(data)
    niti_inds = {
        '% ANC registered in First trimester': 'ANC Registered',
        'Success rate of positive tuberculosis cases': 'TB Cases Success Rate',
        '% of severe anaemic PW treated': 'PW Treated Anaemic',
        '% of new born breastfed within one hour of birth': 'New Born Breasted',
        '% of live babies weighted at birth': 'Live Babies Weighted',
    }

    cmo_inds = {
        'ANC registered within first trimester': 'ANC Registered',
        'PW received 4 or more ANC': 'PW Received',
        'PW treated with severe anemia': 'PW Treated Anemia',
        'HBNC visits': 'HBNC visits',
        'Full immunization': 'Full Immunization',
        'Communicable disease': 'Communicable Disease',
        'Success rate of positive tuberculosis cases': 'TB Cases Success Rate',
    }

    amethi_inds = {
        'NMR reporting (< 4 weeks)': 'NMR reporting',
        'IMR reporting (4 weeks to 12 months)': 'IMR reporting',
        '% ARI/ILI cases reported': 'ARI/ILI cases reported',
        '% pneumonia cases reported': 'Pneumonia cases reported',
        '% diarrhea cases reported': 'Diarrhea cases reported',
        '% PMJAY enrollment (against target)': 'PMJAY enrollment',
    }

    table_view = {'niti_table': niti_inds, 'cmo_table': cmo_inds, 'amethi_table': amethi_inds}

    ind_name = table_view[table]

    # ind_name = {'% ANC registered in First trimester': 'ANC Registered',
    #             'Success rate of positive tuberculosis cases': 'TB Cases Success Rate',
    #             '% of severe anaemic PW treated': 'PW Treated Anaemic',
    #             '% of new born breastfed within one hour of birth': 'New Born Breasted',
    #             '% of live babies weighted at birth': 'Live Babies Weighted'}

    data_filter = {}
    data['date'] = pd.to_datetime(data['date'])
    data['date'] = data.date.dt.strftime('%b %Y')
    data.rename({"date": "month"}, axis='columns', inplace=True)

    if area == 'block':
        data = data[[area,'district_name' ,'indicator', 'perc_point', 'month']]
        # data = data[[area, area+'_id', 'indicator', 'perc_point', 'month']]
    else:
        data = data[[area, 'indicator', 'perc_point', 'month']]  # area = district/division/block

    if area == 'division':
        data = data.groupby(['division', 'indicator', 'month']).mean().reset_index()

    # import pdb; pdb.set_trace();
    end_num = 29
    csv_path = os.path.join(directory, 'data', 'ou_id_mappings.csv')
    ou_data = pd.read_csv(csv_path, encoding='utf8')
    ou_data = ou_data[['uid_block', 'block', 'district']].drop_duplicates().reset_index()
    ou_data.rename(columns={'uid_block': 'block_id'}, inplace=True)

    for k, v in data.groupby('indicator'):
        print(v.columns)
        v.insert(
            v.columns.get_loc('perc_point') + 1,
            'rank',
            v['perc_point'].rank(ascending=1 if k in negative_ind else 0, method='dense'),
        )
        v.sort_values(by=['rank'], inplace=True)
        if table == 'amethi_table':
            name = k[0:end_num] if k not in ind_name.keys() else ind_name[k]
            name = (
                name.replace('[', '_')
                .replace(']', '_')
                .replace(':', '_')
                .replace('*', '_')
                .replace('?', '_')
                .replace('/', '_')
            )
            data_filter[name] = v
            # data_filter[k[0:end_num] if k not in ind_name.keys()
            #             else ind_name[k]] = v
        else:
            # pdb.set_trace();
            data_filter[k[0:end_num] if k not in ind_name.keys() else ind_name[k]] = v.round(2)
            if area == 'block':
                # data_filter[ind_name[k]] = pd.merge(
                #     ou_data, data_filter[ind_name[k]], on='block_id', how='left')
                # data_filter[ind_name[k]].rename(columns={'block_x': 'block'}, inplace=True)
                # data_filter[ind_name[k]] = data_filter[ind_name[k]][[
                #     area, 'indicator', 'perc_point', 'month', 'rank']]
                data_filter[ind_name[k]].fillna('NA', inplace=True)

    data.set_index(area, inplace=True)
    data = data[['indicator', 'perc_point']]
    data = (
        data.reset_index().groupby([area, 'indicator'])['perc_point'].aggregate('first').unstack()
    )

    data = data.reset_index().rename(columns={data.index.name: area})
    for i in data.columns:
        if i != area:
            data.insert(
                data.columns.get_loc(i) + 1,
                'rank_' + i,
                data[i].rank(ascending=1 if i in negative_ind else 0, method='dense'),
            )
    if table != 'amethi_table':
        data = data.round(2)
    final_data = pd.DataFrame()
    for i in data.columns:
        temp = pd.DataFrame()
        data = data.astype('str')
        if i != area and not ('rank_' in i):
            data[i] = pd.to_numeric(data[i], errors='coerce')
            temp = data.sort_values(by=[i], ascending=False if i in negative_ind else True)
            temp.reset_index(inplace=True)
            temp[i] = temp[[area, i]].apply(lambda x: x[area] + "({})".format(x[i]), axis=1)
            final_data[i] = temp[i]
            final_data['rank_' + i] = temp['rank_' + i]
    data_filter['Low_Best_Performing_' + area] = final_data
    return data_filter


def download_data(data, handler):
    dim_districts = gramex.data.filter(
        url=connection_str,
        query='select distinct(district_name) district from dim_phase1_district_data',
    )
    negative_ind = [
        'Still birth ratio',
        '% of facilities reported outlier for the identified indicators of ranking',
    ]
    ind_name = {
        '% of C-section delivery against reported delivery (70% weightage to CHC)': 'C-section(70% weightage to CHC)',
        'Total case notification rate of TB against expected TB cases': 'TB cases notification rate',
    }
    data_filter = {}
    data['date'] = pd.to_datetime(data['date'])
    data['date'] = data.date.dt.strftime('%b %Y')
    data.rename({"date": "month"}, axis='columns', inplace=True)
    comp_data = data[['district', 'composite_index', 'month']].drop_duplicates()
    comp_data.insert(
        comp_data.columns.get_loc('composite_index') + 1,
        'rank',
        comp_data['composite_index'].rank(ascending=0, method='dense'),
    )
    comp_data = comp_data[['district', 'rank', 'month']]
    new_comp_index = data.groupby('district').mean().reset_index()
    new_comp_index = new_comp_index[['district', 'composite_index']]
    comp_data = comp_data.drop_duplicates(subset=['district'])
    comp_data = comp_data.sort_values(by=['district'])
    comp_data = comp_data.reset_index(drop=True)
    comp_data = pd.concat([comp_data, new_comp_index], axis=1)
    comp_data = comp_data.loc[:, ~comp_data.columns.duplicated()]
    comp_data.sort_values(by=['rank'], ascending=True, inplace=True)
    comp_data['composite_index'] = comp_data['composite_index'].round(3)
    data_filter['composite_score'] = comp_data
    data = data[['district', 'indicator', 'perc_point', 'month']]
    end_num = 29
    for k, v in data.groupby('indicator'):
        month = v['month'].iloc[0]
        v = (
            pd.concat([dim_districts, v])
            .drop_duplicates(subset='district', keep='last')
            .reset_index(drop='true')
        )
        v['indicator'] = k
        v['month'] = month
        v.fillna(0, inplace=True)
        v.insert(
            v.columns.get_loc('perc_point') + 1,
            'rank',
            v['perc_point'].rank(ascending=1 if k in negative_ind else 0, method='dense'),
        )
        v.sort_values(by=['rank'], inplace=True)
        data_filter[k[0:end_num] if k not in ind_name.keys() else ind_name[k]] = v.round(2)

    data.set_index('district', inplace=True)
    data = data[['indicator', 'perc_point']]
    data = (
        data.reset_index()
        .groupby(['district', 'indicator'])['perc_point']
        .aggregate('first')
        .unstack()
    )
    data = data.reset_index().rename(columns={data.index.name: 'district'})
    for i in data.columns:
        if i != 'district':
            data.insert(
                data.columns.get_loc(i) + 1,
                'rank_' + i,
                data[i].rank(ascending=1 if i in negative_ind else 0, method='dense'),
            )
    data = data.round(2)
    final_data = pd.DataFrame()
    for i in data.columns:
        temp = pd.DataFrame()
        data = data.astype('str')
        if i != 'district' and not ('rank_' in i):
            data[i] = pd.to_numeric(data[i], errors='coerce')
            temp = data.sort_values(by=[i], ascending=False if i in negative_ind else True)
            temp.reset_index(inplace=True)
            temp[i] = temp[['district', i]].apply(
                lambda x: x['district'] + "({})".format(x[i]), axis=1
            )
            final_data[i] = temp[i]
            final_data['rank_' + i] = temp['rank_' + i]
    data_filter['Low_Best_Performing_District'] = final_data
    return data_filter


def download_data_division(data, handler):
    negative_ind = [
        'Still birth ratio',
        '% of facilities reported outlier for the identified indicators of ranking',
    ]
    ind_name = {
        '% of C-section delivery against reported delivery (70% weightage to CHC)': 'C-section(70% weightage to CHC)',
        'Total case notification rate of TB against expected TB cases': 'TB cases notification rate',
    }
    # data_div = data['division']
    # district_data = data['district']
    # district_data = district_data.query(
    #     'indicator_id == "indicator_13" or indicator_id=="indicator_14"')

    # data = data_div
    data_filter = {}
    data['date'] = pd.to_datetime(data['date'])
    data['date'] = data.date.dt.strftime('%b %Y')
    data.rename({"date": "month"}, axis='columns', inplace=True)
    # district_data.rename({"date": "month"}, axis='columns', inplace=True)
    comp_data = data[['division', 'composite_index', 'month']].drop_duplicates()
    # pdb.set_trace();
    # comp_data_dist = district_data[['division', 'composite_index', 'month']].drop_duplicates()
    # comp_data_dist = comp_data_dist.groupby(['division', 'month']).mean().reset_index()
    # comp_data = comp_data.append(comp_data_dist)
    comp_data = comp_data.groupby(['division', 'month']).mean().reset_index()
    comp_data.insert(
        comp_data.columns.get_loc('composite_index') + 1,
        'rank',
        comp_data['composite_index'].rank(ascending=0, method='dense'),
    )

    comp_data.sort_values(by=['rank'], ascending=True, inplace=True)
    comp_data['composite_index'] = comp_data['composite_index'].round(2)
    comp_data = comp_data[['division', 'composite_index', 'rank', 'month']]
    data_filter['composite_score'] = comp_data
    data = data[['division', 'indicator', 'perc_point', 'month']]

    # data_dist = district_data[['division', 'indicator', 'perc_point', 'month']].drop_duplicates()
    # data_dist = data_dist.groupby(['division', 'indicator', 'month']).mean().reset_index()
    # data = data.append(data_dist)
    data = data.groupby(['division', 'indicator', 'month']).mean().reset_index()
    end_num = 29
    for k, v in data.groupby('indicator'):
        v.insert(
            v.columns.get_loc('perc_point') + 1,
            'rank',
            v['perc_point'].rank(ascending=1 if k in negative_ind else 0, method='dense'),
        )
        v.sort_values(by=['rank'], inplace=True)
        data_filter[k[0:end_num] if k not in ind_name.keys() else ind_name[k]] = v.round(2)

    data.set_index('division', inplace=True)
    data = data[['indicator', 'perc_point']]
    data = (
        data.reset_index()
        .groupby(['division', 'indicator'])['perc_point']
        .aggregate('first')
        .unstack()
    )
    data = data.reset_index().rename(columns={data.index.name: 'division'})
    for i in data.columns:
        if i != 'division':
            data.insert(
                data.columns.get_loc(i) + 1,
                'rank_' + i,
                data[i].rank(ascending=1 if i in negative_ind else 0, method='dense'),
            )
    data = data.round(2)
    final_data = pd.DataFrame()
    for i in data.columns:
        temp = pd.DataFrame()
        data = data.astype('str')
        if i != 'division' and not ('rank_' in i):
            data[i] = pd.to_numeric(data[i], errors='coerce')
            temp = data.sort_values(by=[i], ascending=False if i in negative_ind else True)
            temp.reset_index(inplace=True)
            temp[i] = temp[['division', i]].apply(
                lambda x: x['division'] + "({})".format(x[i]), axis=1
            )
            final_data[i] = temp[i]
            final_data['rank_' + i] = temp['rank_' + i]
    data_filter['Low_Best_Performing_division'] = final_data
    return data_filter


def download_data_block(data, handler):
    negative_ind = [
        'Still birth ratio',
        '% of facilities reported outlier for the identified indicators of ranking',
        'Availability of ASHA to total rural population',
        'Est Delivery load as per available Delivery Point',
        'Est Delivery load as per available SBA trained staff Nurse / ANM',
    ]
    ind_name = {
        '% of C-section delivery against reported delivery (70% weightage to CHC)': 'C-section(70% weightage to CHC)',
        'Total case notification rate of TB against expected TB cases': 'TB cases notification rate',
        'Est Delivery load as per available SBA trained staff Nurse / ANM': 'Est Dlvry ld (Nurse or ANM)',
        'Est Delivery load as per available Delivery Point': 'Est Dlvry ld (Dlvry Point)',
    }
    data_filter = {}
    data['date'] = pd.to_datetime(data['date'])
    data['date'] = data.date.dt.strftime('%b %Y')
    data.rename({"date": "month"}, axis='columns', inplace=True)
    comp_data = data[['block', 'composite_index', 'month', 'district']].drop_duplicates()
    comp_data.insert(
        comp_data.columns.get_loc('composite_index') + 1,
        'rank',
        comp_data['composite_index'].rank(ascending=0, method='dense'),
    )
    comp_data['block'].replace('', np.nan, inplace=True) #jyoti comment
    comp_data['district'].replace('', np.nan, inplace=True) #jyoti comment
    comp_data.dropna(subset=['block'], inplace=True) #jyoti comment
    # comp_data.to_csv('composite_jyoti.csv')

    comp_data.sort_values(by=['rank'], ascending=True, inplace=True)
    data_filter['composite_score'] = comp_data
    comp_data['composite_index'] = comp_data['composite_index'].round(2)
    data = data[['block', 'block_id', 'indicator', 'perc_point', 'month', 'district']]
    end_num = 29
    # csv_path = os.path.join(directory, 'data', 'ou_id_mappings.csv')
    # ou_data = pd.read_csv(csv_path, encoding='utf8')
    # ou_data = ou_data[['uid_block', 'block', 'district']].drop_duplicates().reset_index()
    # ou_data.rename(columns={'uid_block': 'block_id'}, inplace=True)
    for k, v in data.groupby('indicator'):
        if k in [
            'Availability of ASHA to total rural population',
            'Est Delivery load as per available Delivery Point',
            'Est Delivery load as per available SBA trained staff Nurse / ANM',
        ]:
            v['perc_point'] = v['perc_point'].replace(0, 99999)
            v.insert(
                v.columns.get_loc('perc_point') + 1,
                'rank',
                v['perc_point'].rank(ascending=1 if k in negative_ind else 0, method='dense'),
            )
            v['perc_point'] = v['perc_point'].replace(99999, 0)
        else:
            v.insert(
                v.columns.get_loc('perc_point') + 1,
                'rank',
                v['perc_point'].rank(ascending=1 if k in negative_ind else 0, method='dense'),
            )
        v.sort_values(by=['rank'], inplace=True)
        data_filter[k[0:end_num] if k not in ind_name.keys() else ind_name[k]] = v.round(2)
        # data_filter[k[0:end_num]] = pd.merge(
        #     ou_data, data_filter[k[0:end_num]], on='block_id', how='left')
        # data_filter[k[0:end_num]] = data_filter[k[0:end_num]][
        #     ['block_x', 'district_x', 'indicator', 'rank', 'perc_point', 'month']]
        # data_filter[k[0:end_num]].rename(
        #     columns={'block_x': 'block', 'district_y': 'district'}, inplace=True)
    data.set_index('block', inplace=True)
    data = data[['indicator', 'perc_point', 'district']]
    data = (
        data.reset_index()
        .groupby(['block', 'district', 'indicator'])['perc_point']
        .aggregate('first')
        .unstack()
    )
    data = data.reset_index().rename(columns={data.index.name: 'block'})
    for i in data.columns:
        if i != 'block':
            data.insert(
                data.columns.get_loc(i) + 1,
                'rank_' + i,
                data[i].rank(ascending=1 if i in negative_ind else 0, method='dense'),
            )
    data = data.round(2)
    final_data = pd.DataFrame()
    for i in data.columns:
        temp = pd.DataFrame()
        data = data.astype('str')
        if i != 'block' and not ('rank_' in i):
            data[i] = pd.to_numeric(data[i], errors='coerce')
            temp = data.sort_values(by=[i], ascending=False if i in negative_ind else True)
            temp.reset_index(inplace=True)
            temp[i] = temp[['block', i]].apply(lambda x: x['block'] + "({})".format(x[i]), axis=1)
            final_data[i] = temp[i]
            final_data['rank_' + i] = temp['rank_' + i]
    data_filter['Low_Best_Performing_block'] = final_data
    return data_filter


def indicators_by_domain(data, handler, filters=''):
    """
    Returns data frame calculating mean of only domain
    indicator index by date, quater, year.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    if len(handler.get_arguments('date')) != 0:
        if filters == 'amethi':
            data = (
                data.groupby(
                    ['date', 'domain', 'indicator_id', 'indicator', 'Weight'], as_index=False
                )['indicator_index', 'perc_point']
                .mean()
                .fillna(0)
            )
            data['weightage'] = data['indicator_index'] / data['Weight'] * 100
            return data
        else:
            return (
                data.groupby(['date', 'domain', 'indicator_id', 'indicator'], as_index=False)[
                    'indicator_index', 'perc_point'
                ]
                .mean()
                .fillna(0)
            )
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
        return (
            data.groupby(['domain', 'quarter', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )
    else:
        return (
            data.groupby(['domain', 'year', 'indicator_id', 'indicator'], as_index=False)[
                'indicator_index', 'perc_point'
            ]
            .mean()
            .fillna(0)
        )


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
        return data.groupby(['quarter', 'date', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'perc_point',
        ].mean()
    else:
        return data.groupby(['year', 'date', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'perc_point',
        ].mean()


def block_view(data, handler, filters=''):
    """
    Returns data frame calculating mean of indicator index by composite, indicator, type
    and domain index with map_id and composite_rank at block level.
    """
    if filters == 'amethi':
        data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        data['perc_point'] = data['perc_point'] * 100
        data['composite_index'] = data['composite_index'] * 100
    if len(handler.get_arguments('date')) != 0:
        if filters == 'amethi' and handler.get_arguments('indicator_id')[0] != '':
            return data.groupby(['date', 'block', 'indicator_rank'], as_index=False)[
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
        return data.groupby(['quarter', 'date', 'block'], as_index=False)[
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
        return data.groupby(['year', 'date', 'block'], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'map_id',
            'count',
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
        data = data.groupby(['quarter', 'date', type_], as_index=False)[
            'composite_index',
            'indicator_index',
            'type_index',
            'domain_index',
            'composite_rank',
            'div_map_id',
            'perc_point',
        ].mean()
    else:
        data = data.groupby(['year', 'date', type_], as_index=False)[
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


def let_user_know(res, req, handler):
    """Send update message to users phonenumber."""
    ignore_cols = ['password']
    user = handler.get_argument('user', '')
    phonenumber = handler.get_argument('phonenumber', '')
    template_id = ''
    if handler.request.method == 'PUT':
        message = "Your details for Uttar Pradesh Health Dashboard are updated. "
        message += "{} is user.".format(user)
        template_id = 1207166626811085534
    elif handler.request.method == 'POST':
        # set temp password
        password = [temp_password()]
        message = "Your registration for Uttar Pradesh Health Dashboard is Approved. "
        message += "You can now access the application."
        message += "{} is user and {} is temporary password.".format(user, password[0])
        handler.args['password'] = [hashlib.sha256(password[0].encode()).hexdigest()]
        handler.args['temp_password'] = ['1']
        gramex.data.update(
            connection_str, table='user_details', id=['user', 'phonenumber'], args=handler.args
        )
        template_id = 1207166626855253608
    elif handler.request.method == 'DELETE':
        message = "Your Account for Uttar Pradesh Health Dashboard is deleted."
        template_id = 1207166626861420098
    if handler.request.method != 'GET':
        send_sms(phonenumber, message, template_id)
    # show Not Approved users on top of the table
    if isinstance(res, pd.DataFrame) and 'Approval' in res.columns:
        res = res.sort_values(by='Approval', ascending=False)
        res = res.loc[:, ~res.columns.isin(ignore_cols)]
    col_order = [
        'division',
        'district',
        'block',
        'user',
        'name',
        'phonenumber',
        'designation',
        'email',
        'Approval',
        'created_on',
        'last_updated_by',
    ]
    if isinstance(res, pd.DataFrame):
        return res if 'district' not in res.columns else res[col_order]
    return res


def merge_reg_login_user(args, data, handler):
    """Prepare args for user registration by admin."""
    current_date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if handler.request.method == 'PUT':
        args.update({'last_updated_by': [current_date]})
    if handler.request.method == 'POST':
        # tests
        if not args.get('user')[0]:
            raise HTTPError(BAD_REQUEST, 'Username cannot be empty')
        # if not args.get('district')[0]:
        #     raise HTTPError(BAD_REQUEST, 'District cannot be empty')
        # if not args.get('division')[0]:
        #     raise HTTPError(BAD_REQUEST, 'Division cannot be empty')
        if not args.get('designation')[0]:
            raise HTTPError(BAD_REQUEST, 'Designation cannot be empty')
        if not args.get('phonenumber')[0]:
            raise HTTPError(BAD_REQUEST, 'Phone number cannot be empty')
        user = handler.get_argument('user')
        phonenumber = handler.get_argument('phonenumber')
        df = pd.read_sql('SELECT user, phonenumber FROM user_details', connection_str)
        phones = df['phonenumber'].values.tolist()
        users = df['user'].values.tolist()
        if phonenumber in phones:
            raise HTTPError(BAD_REQUEST, 'Phone number cannot repeat')
        if user in users:
            raise HTTPError(BAD_REQUEST, 'User cannot repeat')
        # if(df[(df['user'].isin([user])) & (df['phonenumber'].isin([phonenumber]))]):
        if user in users and phonenumber in phones:
            raise HTTPError(BAD_REQUEST, 'User and phone number together cannot repeat')
        if handler.get_argument('district') and not handler.get_argument('block'):
            # district user
            fpath = os.path.join(directory, 'data', 'divisions-districts-mapping.csv')
            df = gramex.cache.open(fpath)
            args.update({'map_id': df[df['district'] == args['district'][0]]['map_id']})
        elif handler.get_argument('division') and not handler.get_argument('district'):
            # division user
            fpath = os.path.join(directory, 'data', 'divisions-districts-mapping.csv')
            df = gramex.cache.open(fpath)
            args.update({'map_id': df[df['division'] == args['division'][0]]['div_map_id']})
        if args.get('user'):
            args.update(
                {'Approval': ['Approved'], 'temp_password': ['0'], 'created_on': [current_date]}
            )
    return args


def send_otp(handler):
    """Send OTP to user's phone number."""
    expiry = 30
    otp = gramex.handlers.authhandler.OTP(5).token('user', 'email', expiry)
    phonenumber = handler.get_argument('phonenumber', '')
    # query = "select * from user_details where phonenumber='{}'".format(phonenumber)
    # df = gramex.data.filter(connection_str, table='user_details', query=query)
    query = "select * from user_details where phonenumber='{phonenumber}'"
    df = gramex.data.filter(
        connection_str, table='user_details', query=query, args={"phonenumber": [phonenumber]}
    )
    user_name = df['user'].values.tolist()[0]
    if len(user_name) == 0:
        return "fail"
    otp_message = "Your OTP is {} to reset password for ".format(otp)
    otp_message = otp_message + "user {} on Uttar Pradesh Health Dashboard.".format(user_name)
    send_sms(phonenumber, otp_message, 1207166626867164384)
    handler.args['user'] = [user_name]
    handler.args['otp'] = [otp]

    gramex.data.update(
        connection_str, table='user_details', id=['user', 'phonenumber'], args=handler.args
    )
    return "success"


def send_sms(ph_num, msg, template_id):
    # status = gramex.service.sms['exotel'].send(
    #     to=ph_num, subject=msg, sender='UPHEAL'
    # )
    query = {
        'username': 'indianhealth',
        'password': '12345678',
        'mobile': ph_num,
        'sendername': 'NHMUPH',
        'message': msg,
        'templateid': template_id,
    }
    status = requests.post('http://smsaanvi.alert.ind.in/sms_api/sendsms.php', params=query)
    status_code = 200
    if status == status_code:
        args = {'timestamp': [time.time()], 'phone_number': [ph_num], 'message': [msg]}
        gramex.data.insert(connection_str_sqlite, table='details', id=['timestamp'], args=args)


def send_pending_aprovals():
    query = "select * from user_details where Approval='Not Approved'"
    df = gramex.data.filter(connection_str, table='user_details', query=query)
    if len(df) == 0:
        return "fail"
    otp_message = "There are {} pending approvals. ".format(len(df))
    otp_message += "Kindly visit the admin page to approve."
    send_sms('7738777639', otp_message, 1207166626872459616)
    mailer = service.email['gramex-guide-gmail']
    to_send = ['karthikeyan.l@ihat.in', 'amit.kumar@ihat.in', 'sushant.sonar@ihat.in']
    for i in to_send:
        mailer.mail(to=i, subject='UP-TSU Pending Approval Status', html=otp_message, body='')
    return "sucess"


def temp_password():
    """Generate temporary password."""
    # when admin adds a new user
    # when user registers themselves. 1440 mins, 1 day
    expiry_mins = 1400
    return gramex.handlers.authhandler.OTP(6).token('user', 'email', expiry_mins)


def get_last_update(data):
    """Returns last date from data."""
    return pd.DataFrame.from_dict(
        {'last_date': pd.to_datetime(data['date']).max().strftime('%Y-%m-%d')}, orient='index'
    )


def approve_user(args, data, handler):
    """Approves user."""
    add_user(handler)
    return args


def only_password():
    """Generate password."""
    import secrets
    import string

    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(10))


def set_password(args, data, handler):
    """Set password for new user registration."""
    # add map_id from divisions-districts-mapping.csv
    # based on district selected
    df = pd.read_sql('SELECT user, phonenumber FROM user_details', connection_str)
    phones = df['phonenumber'].values.tolist()
    users = df['user'].values.tolist()
    user = handler.get_argument('user')
    phonenumber = handler.get_argument('phonenumber')
    if phonenumber in phones:
        raise HTTPError(BAD_REQUEST, 'Phone number cannot repeat')
    if user in users:
        raise HTTPError(BAD_REQUEST, 'User cannot repeat')
    if user in users and phonenumber in phones:
        raise HTTPError(BAD_REQUEST, 'User and phone number together cannot repeat')
    if handler.get_argument('district') and not handler.get_argument('block'):
        # district user
        fpath = os.path.join(directory, 'data', 'divisions-districts-mapping.csv')
        df = gramex.cache.open(fpath)
        args.update({'map_id': df[df['district'] == args['district'][0]]['map_id']})
    message = "You are a new user for Uttar Pradesh Health Dashboard. "
    message += "Admin approval is pending. Login credentials will be shared after approval."
    send_sms(phonenumber, message, 1207166626877613162)
    args.update({'created_on': [datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')]})
    return args


def validate(args, handler):
    user_pattern = re.compile("[a-zA-Z_]+$")
    phone_pattern = re.compile("[6-9]{1}[0-9]{9}$")
    if 'user' in args:
        if not user_pattern.match(handler.get_argument('user')):
            raise HTTPError(BAD_REQUEST, 'Username cannot have special characters')
    if not phone_pattern.match(handler.get_argument('phonenumber', '')):
        raise HTTPError(BAD_REQUEST, "Invalid phone number")
    return args


def registration_otp(handler):
    """Send OTP to registered phone number."""
    expiry = 30
    otp = gramex.handlers.authhandler.OTP(5).token('user', 'email', expiry)
    phonenumber = handler.get_argument('phonenumber', '')
    pattern = re.compile("[6-9]{1}[0-9]{9}$")
    if pattern.match(phonenumber):
        otp_message = "Your OTP is {otp_num} to register for UP Health Dashboard".format(
            otp_num=otp
        )
        send_sms(phonenumber, otp_message, 1207166626893078619)
        return "{}".format(otp)
    else:
        return ""


def get_list_of_files(handler):
    _path = 'data_pdf/'
    _files = [f for f in os.listdir(os.path.join(directory, _path)) if not f.startswith('.')]
    return json.dumps(_files)


def download_pdf(handler):
    args = handler.argparse('filename')
    handler.set_header('Content-Type', 'application/pdf')
    handler.set_header('Content-Disposition', 'attachment; filename=' + args.filename)
    return open(os.path.join(directory, 'data_pdf', args.filename), 'rb').read()


def download_apk(handler):
    args = handler.argparse('filename')
    handler.set_header('Content-Type', 'application/apk')
    handler.set_header('Content-Disposition', 'attachment; filename=' + args.filename)
    return open(os.path.join(directory, 'data', args.filename), 'rb').read()


def delete_pdf(handler):
    args = handler.argparse('filename')
    os.remove(os.path.join(directory, 'data_pdf', args.filename))


def rename_image(metadata, handler):
    """Rename uploaded profile picture."""
    profile_pic_path = os.path.join(directory, 'profile_pic')
    filename = metadata.get('filename', '')
    currname = os.path.join(profile_pic_path, filename)
    filename_split = filename.split('.')
    if len(filename_split) != 2:
        os.remove(currname)
        raise HTTPError(BAD_REQUEST, "File has double extension")
    if filename_split[1] != 'png' and filename_split[1] != 'svg':
        os.remove(currname)
        raise HTTPError(BAD_REQUEST, "Upload png or svg only")
    if metadata.mime != 'image/png' and metadata.mime != 'image/svg+xml':
        os.remove(currname)
        raise HTTPError(BAD_REQUEST, "Upload png or svg only")
    phonenumber = ''
    try:
        phonenumber = metadata.get('data', '')['mobilenumber'][0]
    except Exception:  # noqa
        raise HTTPError(BAD_REQUEST, "mobile number not present")
    if phonenumber != '':
        newname = 'pic_' + phonenumber + os.path.splitext(filename)[1]
        newname = os.path.join(profile_pic_path, newname)
        try:
            os.rename(currname, newname)
        except WindowsError:
            os.remove(newname)
            os.rename(currname, newname)


def get_config(handler):
    """Return config defined in handler."""
    return json.dumps(handler.kwargs.config)


def user_approval(handler):
    """User approval by admin."""
    user = handler.get_argument('user', '')
    phonenumber = handler.get_argument('phonenumber', '')
    approve = handler.get_argument('Approval', '')
    approve = 'Approved' if approve == 'Approved' else 'Not approved'
    # approved user should get an SMS with username, temporary password
    # save those in the database
    message = "Your registration for Uttar Pradesh Health Dashboard is {}. ".format(approve)
    if approve == 'Approved':
        password = temp_password()
        handler.args['password'] = [hashlib.sha256(password.encode()).hexdigest()]
        handler.args['temp_password'] = ['1']
        handler.args['last_updated_by'] = [datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')]
        message += "You can now access the application."
        message += "{} is user and {} is temporary password.".format(user, password)
    try:
        gramex.data.update(
            connection_str, table='user_details', id=['user', 'phonenumber'], args=handler.args
        )
        send_sms(phonenumber, message, 1207166626903476639)
    except Exception:  # noqa
        return "fail"
    return "success"


def modify_analysis(data):
    data['Date'] = data['Date'].apply(
        lambda x: pd.to_datetime(x, format="%Y-%m-%d %H:%M:%S").strftime('%d-%m-%Y')
    )
    return data


def modify_log_analysis(data):
    data['Date'] = data['created_at'].apply(
        lambda x: pd.to_datetime(x, format="%Y-%m-%d %H:%M:%S").strftime('%d-%m-%Y')
    )

    data = data.drop(columns=['created_at'])

    data['Time_Spent'] = data['Time_Spent'].astype('str').str[-18:-10]

    return data


def session_vals():
    """User session values."""
    month = 30
    start_date = datetime.datetime.now() + datetime.timedelta(-month)
    start_date = start_date.strftime('%Y-%m-%d')
    connection_str = 'sqlite:///{}/up-tsu-desktop/' 'logviewer.db'.format(variables['GRAMEXDATA'])
    # query = "select * from aggD where time>='{}'".format(start_date)
    # data = gramex.data.filter(connection_str, table="aggD", query=query)
    query = "select * from aggD where time>='{start_date}'"
    data = gramex.data.filter(
        connection_str, table="aggD", query=query, args={"start_date": [start_date]}
    )
    users = data['user.id'] if 'user.id' in data.columns else data['id']
    return users.drop_duplicates().tolist()


def active_session(handler):
    session = handler.session
    if 'user' in session.keys():
        return 'true'
    return 'false'


def save_password(handler):
    """Reset password."""
    password = handler.get_argument('password', '')
    argss = {
        'user': [handler.get_argument('user', '')],
        'password': [password],
        'phonenumber': [handler.get_argument('phonenumber')],
        'temp_password': '0',
    }
    res = gramex.data.update(
        connection_str, table='user_details', id=['user', 'phonenumber'], args=argss
    )
    message = "Your password reset for Uttar Pradesh Health Dashboard is complete. "
    message += "You can now access the application with {} as user.".format(
        handler.get_argument('user', '')
    )
    send_sms(handler.get_argument('phonenumber'), message, 1207166626910605745)
    if res == 1:
        return 'success'


# UNUSED utilities
def update_password(handler):
    """Update password of a user."""
    # UNUSED?
    args = {
        'user': handler.get_argument('user', ''),
        'district': handler.get_argument('district', ''),
        'password': handler.get_argument('user_password', ''),
        'phonenumber': handler.get_argument('user_mobilenumber'),
    }
    gramex.data.update(connection_str, table='user_details', id=['user', 'phonenumber'], args=args)


def send_approval(phonenumber, user, designation):
    """Send approval message to users phonenumber."""
    # UNUSED?
    message = "Your registration for Uttar Pradesh Health Dashboard is approved. "
    message += "You can now access the application."
    message += "User - {} Password - {}@123".format(user, designation)
    send_sms(phonenumber, message, 1207166626916769565)


def add_user(handler):
    """Adds user to user_login list."""
    # UNUSED?
    designation = handler.get_argument('designation', '')
    args = {
        'user': handler.get_argument('user', ''),
        'district': handler.get_argument('district', ''),
        'designation': designation,
        'password': designation.lower() + '@123',
        'name': handler.get_argument('name', ''),
        'phonenumber': handler.get_argument('phonenumber'),
    }
    gramex.data.insert(connection_str, table='user_details', id=['user', 'phonenumber'], args=args)


def merge_inactive_users(data):
    inactive_users = pd.DataFrame()
    for month in data['logs'].month.unique().tolist():
        month_logs = data['logs'][data['logs']['month'] == month]
        data['users']['month'] = month
        inactive_users = pd.concat([inactive_users, month_logs, data['users']]).drop_duplicates(
            keep=False
        )
    return inactive_users


def get_cmo_indicator_filter_data(data, handler):
    # print("here"*30, indicator_value)
    # pdb.set_trace();
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

    # for dist in district_ids:
    #     sum_data = rank_df.query('id == @dist')
    #     sum_data.loc[:, 'rank_sum'] = sum_data['rank_value'].sum()
    # #     data.loc[:,'rank'] = data['rank_sum'].rank(method='dense',ascending=False)
    #     sum_df = sum_df.append(sum_data)

    sum_df = rank_df.groupby(['id'])['rank_value'].sum().reset_index()
    sum_df.rename(columns={'rank_value': 'rank_sum'}, inplace=True)
    # sum_df
    sum_df = sum_df.merge(rank_df, on=['id'], how="left")

    sum_df['rank'] = sum_df.groupby(['indicator_id'])['rank_sum'].rank(
        method='dense', ascending=False
    )
    sum_df.fillna('NA', inplace=True)
    data = sum_df
    # pdb.set_trace()
    data = pivot_function_cmo(data, ['id', 'rank', 'name'], ['ind_name'], 'perc_point')
    if not indicator_value:
        data = data[variables['pivot_cols']]
    return data
    # return pivot_function_cmo(
    #     data, ['id', 'rank', 'name'], ['ind_name'], 'perc_point')


def get_cmo_division_data(data, handler):
    return pivot_function_cmo(data, ['id', 'name'], ['ind_name'], 'perc_point')


def get_cmo_sub_indicator_filter_data(data, handler):
    return pivot_function_cmo(data, ['id', 'ind_id', 'filter_id'], ['sub_name'], 'value')


def get_cmo_sub_division_data(data, handler):
    return pivot_function_cmo(data, ['id', 'ind_id'], ['sub_name'], 'value')


def pivot_function_cmo(data, index, column, value_column):
    data = pd.pivot_table(data, values=value_column, index=index, columns=column, aggfunc='sum')
    data = data.reset_index()
    # import pdb
    # pdb.set_trace();
    return data


def get_search_div_dist_blck(data, handler):
    search_str = handler.get_argument('search', '')
    if search_str != "":
        return data[data['name'].str.lower().str.find(search_str) > -1][['name', 'view', 'id']]


def ou_id_mappings(data, handler):
    data = data.drop_duplicates(['block', 'uid_block', 'district', 'uid_district'])
    data = data[['block', 'uid_block', 'district', 'uid_district']]
    return data


def download_cmo_data(data, handler):
    # import pdb;
    # data['main_data'].fillna(0, inplace=True)
    # data['sub_data'].fillna(0, inplace=True)

    # main_data = pivot_function_cmo(data['main_data'], ['id', 'name'], ['ind_name'], 'perc_point')
    # sub_data = pivot_function_cmo(data['sub_data'], ['id'], ['sub_name'], 'value')
    main_data = data['main_data']
    sub_data = data['sub_data']
    # sub_data['id'] = sub_data['id'].astype('int64')
    mer_data = pd.merge(main_data, sub_data, on=['id', 'indicator_id'], how='left')
    mer_data.rename(columns={'Communicable disease': 'TB Notification'}, inplace=True)
    mer_data.fillna('NA', inplace=True)
    sub_ind_name = variables['sub_ind_col_names']
    mer_data['sub_short_name'] = mer_data['sub_name'].apply(lambda x: sub_ind_name[x])
    mer_data.drop(['id'], axis=1, inplace=True)
    # final_list = []
    data_filter = {}
    end_num = 29
    for k, v in mer_data.groupby('ind_name'):
        data_filter[k[0:end_num]] = v.round(2)

    # second_list = [
    #     "id", "name",
    #     "% of positive malaria cases identified against total" +
    #     " tested in the district up to the month",
    #     "9a", "9b", "ANC registered within first trimester", '1a', '1b',
    #     'TB Notification', '7a', '7b',
    #     "Full immunization", '6a', '6b', "HBNC visits", '5a', '5b',
    #     "PW received 4 or more ANC", '2a', '2b',
    #     "PW treated with severe anemia", '3a', '3b',
    #     "Success rate of positive tuberculosis cases", '8a']

    # sub_ind_name = variables['sub_ind_col_names']

    # mer_data['sub_short_name'] = mer_data['sub_name'].apply(lambda x: sub_ind_name[x])
    # mer_data.rename(columns={'sub_name': 'sub_id', 'sub_short_name': 'sub_name'}, inplace=True)
    # mer_data = mer_data[['name', 'ind_name', 'perc_point', 'indicator_id',
    #                      'weight', 'ind_id', 'sub_id', 'sub_name', 'value']]

    # second_list = variables['second_list']
    # main_list = mer_data.columns.tolist()
    # for item in second_list:
    #     if item in main_list:
    #         final_list.append(item)

    # temp_col = mer_data.reindex(columns=final_list)
    # temp_col.drop(['id'], axis=1)

    # ind_cols = variables['ind_list']

    # ind_data = temp_col[variables['ind_list']]
    # sub_ind_data = temp_col[variables['sub_ind_list']]
    # sub_ind_data.rename(columns=variables['sub_ind_col_names'], inplace=True)

    # temp_col.rename(columns=variablaies['sub_ind_col_names'], inplace=True)

    # data_filter['indicators'] = ind_data
    # data_filter['sub_indicators'] = sub_ind_data

    return data_filter
    # return temp_col


def max_date_args(args, handler):
    date = handler.get_argument('date', None)
    if not date:
        date = pd.read_sql(
            'SELECT max(date) as date FROM fact_cmo_district_data_monthly', connection_str
        )
        if len(date) > 0:
            # date = date.iloc[0]['date'].strftime('%Y-%m-%d')
            date = date.iloc[0]['date']
            args.update({'date': [date]})


def max_date_args_district(args, handler):
    date = handler.get_argument('date', None)
    if not date:
        date = pd.read_sql(
            'SELECT max(date) as date FROM fact_phase1_district_data_monthly', connection_str
        )
        if len(date) > 0:
            date = date.iloc[0]['date'].strftime('%Y-%m-%d')
            args.update({'date': [date]})


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


def indicator_value_query(args):
    indicator = args.get('indicator', [None])[0]
    format_value = ""
    if indicator:
        format_value = "AND t2.indicator_name = '{indicator}'".format(indicator=indicator)
    return format_value


def block_data_monthly_query(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
            t2.district_id, t2.district_name AS district,
            CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
            t2.type_name as type, t2.domain_name as domain
            FROM fact_phase1_block_data_monthly t1
            LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
            AND t1.indicator_id = t2.indicator_id
            WHERE t1.date = '{date}'
            """
    format_value = indicator_value_query(args)
    # import pdb;pdb.set_trace()
    query = query + format_value

    return query


def block_data_quarterly_query(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
            t2.district_id, t2.district_name AS district,
            CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
            t2.type_name as type, t2.domain_name as domain
            FROM fact_phase1_block_data_quaterly t1
            LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
            AND t1.indicator_id = t2.indicator_id
            WHERE t1.year = {year} AND t1.quarter = {quarter}
            """
    format_value = indicator_value_query(args)
    query = query + format_value

    return query


def block_data_yearly_query(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator, t2.district_id,
            t2.district_name AS district,
            CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
            t2.type_name as type, t2.domain_name as domain
            FROM fact_phase1_block_data_yearly t1
            LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
            AND t1.indicator_id = t2.indicator_id
            WHERE t1.year = {year}
            """
    format_value = indicator_value_query(args)
    query = query + format_value

    return query


def block_area_data_monthly(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
                t2.district_id, t2.district_name AS district,
                CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
                DATE_FORMAT(t1.date, '%Y-%m-%d') AS date
                FROM fact_phase1_block_data_monthly t1
                LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
                AND t2.indicator_id = t1.indicator_id
                WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """
    # indicator = args.get('indicator', [None])[0]
    # format_value = ""
    # if indicator:
    #     format_value = "AND t2.indicator_name = '{indicator}'".format(
    #         indicator=indicator)
    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_area_data_quarterly(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
                t2.district_id, t2.district_name AS district,
                CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
                DATE_FORMAT(t1.date, '%Y-%m-%d') AS date
                FROM fact_phase1_block_data_quaterly t1
                LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
                AND t2.indicator_id = t1.indicator_id
                WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """
    # indicator = args.get('indicator', [None])[0]
    # format_value = ""
    # if indicator:
    #     format_value = "AND t2.indicator_name = '{indicator}'".format(
    #         indicator=indicator)
    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_area_data_yearly(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
                t2.district_id, t2.district_name AS district,
                CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
                DATE_FORMAT(t1.date, '%Y-%m-%d') AS date
                FROM fact_phase1_block_data_yearly t1
                LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
                AND t2.indicator_id = t1.indicator_id
                WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """
    # indicator = args.get('indicator', [None])[0]
    # format_value = ""
    # if indicator:
    #     format_value = "AND t2.indicator_name = '{indicator}'".format(
    #         indicator=indicator)
    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_area_data_niti(args):
    query = """SELECT t1.perc_point, t2.indicator_name AS indicator,
              t2.district_id_num as district_id, t2.district_name AS district,
              CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
              DATE_FORMAT(t1.date, '%Y-%m-%d') AS date,
              t2.domain_name as domain, t2.type_name as type
              FROM fact_niti_block_data_monthly t1
              LEFT JOIN dim_niti_block_data t2 ON t2.block_id_num = t1.block_id_num
              AND t2.indicator_id = t1.indicator_id
              WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """

    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_area_data_niti_quarterly(args):
    query = """SELECT t1.perc_point, t2.indicator_name AS indicator,
              t2.district_id_num as district_id, t2.district_name AS district,
              CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
              t2.domain_name as domain, t2.type_name as type,
              DATE_FORMAT(t1.date, '%Y-%m-%d') AS date
              FROM fact_niti_block_data_quaterly t1
              LEFT JOIN dim_niti_block_data t2 ON t2.block_id_num = t1.block_id_num
              AND t2.indicator_id = t1.indicator_id
              WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """

    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_area_data_niti_yearly(args):
    query = """SELECT t1.perc_point, t2.indicator_name AS indicator,
              t2.district_id_num as district_id, t2.district_name AS district,
              CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
              DATE_FORMAT(t1.date, '%Y-%m-%d') AS date,
              t2.domain_name as domain, t2.type_name as type
              FROM fact_niti_block_data_yearly t1
              LEFT JOIN dim_niti_block_data t2 ON t2.block_id_num = t1.block_id_num
              AND t2.indicator_id = t1.indicator_id
              WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
            """

    format_value = indicator_value_query(args)
    query = query + format_value
    return query


def block_data_compare(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
            t2.district_id, t2.district_name AS district,
            CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
            t2.type_name as type, t2.domain_name as domain,
            DATE_FORMAT(t1.date, '%Y-%m-%d') AS date
            FROM fact_phase1_block_data_monthly t1
            LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
            AND t1.indicator_id = t2.indicator_id
            """
    # WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
    bars = args.get('bars', [None])[0]
    accordion = args.get('accordion', [None])[0]
    date = args.get('date', [None])

    # breakpoint()
    format_value = ""
    if bars:
        format_value = "WHERE t1.date = '{date}'".format(date=date[0])
    elif accordion:
        if len(date) == 1:
            format_value = "WHERE (t1.date = '{date_0}')".format(date_0=date[0])
        else:
            format_value = "WHERE (t1.date = '{date_0}' OR t1.date = '{date_1}')".format(
                date_0=date[0], date_1=date[1]
            )
    else:
        date_strt = args.get('date>~', [None])[0]
        date_end = args.get('date<~', [None])[0]
        format_value = "WHERE t1.date BETWEEN '{date_s}' AND '{date_e}'".format(
            date_s=date_strt, date_e=date_end
        )

    query = query + format_value
    # breakpoint()

    return query


def block_data_quarter_compare(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
                t2.district_id, t2.district_name AS district,
                CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
                t2.type_name as type, t2.domain_name as domain,
                DATE_FORMAT(t1.date, '%Y-%m-%d') AS date, t1.year, t1.quarter
                FROM fact_phase1_block_data_quaterly t1
                LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
                AND t1.indicator_id = t2.indicator_id
            """
    # WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
    quarter = args.get('quarter', [None])[0]
    format_value = ""
    if quarter:
        format_value = ""
    else:
        format_value = "WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'"

    query = query + format_value

    return query


def block_data_year_compare(args):
    query = """SELECT t1.composite_index, t1.perc_point, t2.indicator_name AS indicator,
                t2.district_id, t2.district_name AS district,
                CONCAT('blc_', t2.block_id_num) as block_id, t2.block_name AS block,
                t2.type_name as type, t2.domain_name as domain,
                DATE_FORMAT(t1.date, '%Y-%m-%d') AS date, t1.year
                FROM fact_phase1_block_data_yearly t1
                LEFT JOIN dim_phase1_block_data t2 ON t2.block_id_num = t1.block_id_num
                AND t1.indicator_id = t2.indicator_id
            """
    # WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'
    year = args.get('year', [None])[0]
    format_value = ""
    if year:
        format_value = ""
    else:
        format_value = "WHERE t1.date BETWEEN '{date>~}' AND '{date<~}'"

    query = query + format_value

    return query



def error_fn(status, kwargs, handler):
    """Load the error pages as required"""
    error_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'errorpage.html')
    tmpl = gramex.cache.open(error_path, 'template')

    handler.set_status(status)
    return tmpl.generate(kwargs=kwargs, status=status, handler=handler)





def generate_secret_key():
    sixteen = 16
    variables['client_enc_salt'] = secrets.token_urlsafe(sixteen)[:sixteen]
    return variables['client_enc_salt']


def get_captcha_img(handler):
    glob('captcha_fonts/*.ttf')
    # font_list = ['Cadiz-Regular.ttf', 'Gotham-Ultra_1.ttf']
    fonts = []
    # for font in glob('captcha_fonts/*.ttf'):
    for font in glob('*/*.ttf'):
        fonts.append(os.path.join(currdir, font))
    image = ImageCaptcha(fonts=fonts)
    # random_cookie_secret
    # characters = string.ascii_letters + string.digits + string.punctuation
    characters = string.digits
    cook_sec = ""
    # set up random length
    cook_sec_length = random.randint(6, 6)  # nosec B311
    for _ in range(cook_sec_length):
        char = random.choice(characters)  # nosec B311
        cook_sec = cook_sec + char
    # return {'img': str(image.generate(cook_sec))}
    cook_sec = cook_sec.replace('7', '0').replace('1', '2')
    data = base64.b64encode(image.generate(cook_sec).read()).decode("utf-8")
    data = data + generate_secret_key()
    return {'img_data': 'data:image/jpeg;base64,{}'.format(data), 'str': cook_sec}


def district_rank(data, handler):
    indicator_id = handler.get_arguments('indicator_id2')
    if not indicator_id:
        return data[0:1]
    else:
        del data['composite_rank']
        data['composite_rank'] = data['indicator_index'].rank(method='max', ascending=False)
        data['composite_rank'] = data['composite_rank'].astype(int)
        data = data[data['indicator_id'] == int(indicator_id[0])]
        return data


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


def log_aggregator():
    # log_query = "select * from logs where hour(time)=hour(CONVERT_TZ(now(), '+00:00', '+05:30')) - 1 and DATE(`time`)=CURDATE() order by username, time asc;"
    log_query = "select * from logs where DATE(`time`)=DATE(CONVERT_TZ(current_timestamp(), '+00:00', '+05:30')) order by username, time asc;"
    logs = gramex.data.filter(url=connection_str, query=log_query)
    logs['session_time'] = (
        logs.groupby(['username', 'application'])['time']
        .diff()
        .apply(lambda x: x / np.timedelta64(1, 's'))
        .fillna(0)
        .astype('int64')
    )
    logs = logs.rename_axis(None)
    logs = (
        logs.groupby(['username', 'screen', 'application', 'ip'])
        .agg(session_time_sum=('session_time', 'sum'))
        .reset_index()
    )
    # breakpoint()
    logs['created_at'] = pd.to_datetime("now").tz_localize('UTC').tz_convert('Asia/Kolkata')
    # breakpoint()
    # gramex.data.insert(url=connection_str, table="logs_agg", id=["id"], args=logs)
    delete_today_records = "delete from logs_agg where DATE(`created_at`)=DATE(CONVERT_TZ(current_timestamp(), '+00:00', '+05:30'))"
    con.execute(delete_today_records)
    logs.to_sql(con=connection_str, name='logs_agg', if_exists='append', index=False)

    # # logs['session_time'] = logs.groupby(['username'])['time'].diff()
    # logs['session_time'] = logs.groupby(['username'])['time'].diff().apply(lambda x: x/np.timedelta64(1, 's')).fillna(0).astype('int64')
    # # logs = logs.groupby(['username', 'screen', 'application', 'ip']).agg(Mysum=('screen', 'count'), Mycount=('session_time', 'sum')).reset_index()
    # logs = logs.groupby(['username', 'screen', 'application', 'ip']).agg(Visits=('screen', 'count'), session_time=('session_time', 'sum')).reset_index()

    # breakpoint()
    return json.dumps({"result": "success"})
