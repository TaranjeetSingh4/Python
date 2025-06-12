import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
import math

monarr = [
    'None',
    'Jan',
    'Feb',
    'March',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]
worst_indicator = {}
second_worst = {}
"""
    Per ASHA expenditure of ASHA incentive fund this is indicator is
    added because this we should not show in page 3 as per client request
"""
district_indicators = [
    '% of C-section delivery against reported delivery (30% to DH)',
    '% of C-section delivery against reported delivery (70% weightage to CHC)',
    'Total case notification rate of TB against expected TB cases',
    '% of pregnant women received 4 or more ANC and tested for Hb against estimated PW',
    'Per ASHA expenditure of ASHA incentive fund',
]
district_name = ''


def modify_dates_for_page3_end_date(args):
    end_date = datetime.strptime(args["start_date"][0], "%Y-%m-%d")
    end_date = end_date - relativedelta(months=12)
    end_date_c = end_date.strftime("%Y-%m-%d")
    e_date = datetime.strptime(end_date_c, "%Y-%m-%d")
    db_s_date = datetime.strptime('2017-10-01', "%Y-%m-%d")
    if e_date < db_s_date:
        end_date = datetime.strptime('2017-10-01', "%Y-%m-%d")
    args.update(
        {
            "end_date": [end_date.strftime("%Y-%m-%d")],
        }
    )


def page2_area_chart_prepare(args):
    end_date = datetime.strptime(args["start_date"][0], "%Y-%m-%d")
    end_date = end_date - relativedelta(months=13)
    args.update(
        {
            "end_date": [end_date.strftime("%Y-%m-%d")],
        }
    )


def modify_page2(handler, df):
    negative_indicator = [
        "Still birth ratio",
        "% of facilities reported outlier for the identified indicators of ranking",
    ]
    df_old = df['best_performing_district']
    ind_type = {}
    for ind in df['indicator_type'].index:
        ind_type[df['indicator_type']['indicator_name'][ind]] = df['indicator_type']['calc_type'][
            ind
        ]
    max_dist = {}
    visited = list()
    for ind in df_old.index:
        if (
            df_old['indicator_name'][ind] in visited
            and df_old['indicator_name'][ind] not in negative_indicator
        ):
            continue
        else:
            visited.append(df_old['indicator_name'][ind])
            # print(df_old['indicator_name'][ind], df_old['month_wise'][ind])
            if not math.isnan(df_old['month_wise'][ind]):
                max_dist[df_old['indicator_name'][ind]] = (
                    df_old['month_wise'][ind],
                    df_old['district_name'][ind],
                )
            # df_new = pd.concat([df_new, df_old[ind]])
    # print(max_dist)
    df['up_avg']['month_wise'] = df['district_avg']['month_wise']
    df['up_avg']['best_district_score'] = None
    df['up_avg']['best_district_name'] = None
    df['up_avg']['percent_diff'] = None
    for indict in df['up_avg']['indicator_name']:
        if (
            indict == 'Permanent Method accepted per 1000 EC'
            or indict == 'Reversible Method accepted per 1000 EC'
        ):
            df['up_avg']['up_avg'] = df['up_avg']['up_avg'].round(decimals=2)
            df['up_avg']['month_wise'] = df['up_avg']['month_wise'].round(decimals=2)
        else:
            df['up_avg']['up_avg'] = df['up_avg']['up_avg'].round(decimals=1)
            df['up_avg']['month_wise'] = df['up_avg']['month_wise'].round(decimals=1)
    above_up_avg = below_up_avg = 0
    maxsofar = 0
    for ind in df['up_avg'].index:
        df['up_avg']['best_district_score'][ind] = max_dist[df['up_avg']['indicator_name'][ind]][0]
        df['up_avg']['best_district_name'][ind] = max_dist[df['up_avg']['indicator_name'][ind]][1]
        if ind_type[df['up_avg']['indicator_name'][ind]] != 'p':
            percent_diff_val = (
                (df['up_avg']['up_avg'][ind] - df['up_avg']['month_wise'][ind])
                / df['up_avg']['up_avg'][ind]
            ) * 100
            df['up_avg']['percent_diff'][ind] = percent_diff_val
        else:
            percent_diff_val = (
                (df['up_avg']['month_wise'][ind] - df['up_avg']['up_avg'][ind])
                / df['up_avg']['up_avg'][ind]
            ) * 100
            df['up_avg']['percent_diff'][ind] = percent_diff_val

        list_ = [
            "% of facilities reported non blank value (including zero) for the identified indicators of ranking",
            "% of facilities reported outlier for the identified indicators of ranking",
        ]
        if df['up_avg']['indicator_name'][ind] not in list_:
            if percent_diff_val < 0 and percent_diff_val < maxsofar:
                # if df['up_avg']['indicator_name'][ind] in district_indicators:
                #     second_worst = worst_indicator
                #     print('yes')
                # breakpoint()
                maxsofar = percent_diff_val
                worst_indicator['name'] = df['up_avg']['indicator_name'][ind]
                worst_indicator['score'] = df['up_avg']['month_wise'][ind]
                worst_indicator['up_avg'] = df['up_avg']['up_avg'][ind]
                worst_indicator['best_dist'] = df['up_avg']['best_district_name'][ind]
                worst_indicator['best_dist_score'] = df['up_avg']['best_district_score'][ind]
                worst_indicator['indicator_id'] = df['up_avg']['indicator_id'][ind]
                second_worst['name'] = df['up_avg']['indicator_name'][ind]
                second_worst['score'] = df['up_avg']['month_wise'][ind]
                second_worst['up_avg'] = df['up_avg']['up_avg'][ind]
                second_worst['best_dist'] = df['up_avg']['best_district_name'][ind]
                second_worst['best_dist_score'] = df['up_avg']['best_district_score'][ind]
                second_worst['indicator_id'] = df['up_avg']['indicator_id'][ind]
            if percent_diff_val >= 0:
                above_up_avg += 1
            elif percent_diff_val < 0:
                below_up_avg += 1
    # breakpoint()
    cols = [
        'indicator_name',
        'month_wise',
        'up_avg',
        'best_district_score',
        'best_district_name',
        'percent_diff',
        'indicator_id',
    ]
    old_res = df['up_avg']
    res = df['up_avg'][cols]
    """
        list_ = ["% of facilities reported non blank value (including zero) for the identified
        indicators of ranking",
                 "% of facilities reported outlier for the identified indicators of ranking"]
    """
    last = res[res['indicator_name'].isin(list_)]
    # breakpoint()
    res = res[~res['indicator_name'].isin(list_)]
    old_res = old_res[~old_res['indicator_name'].isin(list_)]
    # breakpoint()
    res = res.sort_values(by='percent_diff', ascending=True)
    old_res = old_res.sort_values(by='percent_diff', ascending=True)
    if worst_indicator['name'] in district_indicators:
        for ind in old_res.index:
            # print(res['indicator_name'][ind])
            if old_res['indicator_name'][ind] not in district_indicators:
                second_worst['name'] = old_res['indicator_name'][ind]
                second_worst['score'] = old_res['month_wise'][ind]
                second_worst['up_avg'] = old_res['up_avg'][ind]
                second_worst['best_dist'] = old_res['best_district_name'][ind]
                second_worst['best_dist_score'] = old_res['best_district_score'][ind]
                second_worst['indicator_id'] = old_res['indicator_id'][ind]
                break
    last = last.fillna(0)
    return {
        'res': res,
        'last': last,
        'indicator_sequence': old_res,
        'district_name': df['districtname'],
        'comp_up_avg': pd.DataFrame(
            {'above_up_avg': above_up_avg, 'below_up_avg': below_up_avg}, index=['row1']
        ),
        'worst_indicator': pd.DataFrame(worst_indicator, index=['row1']),
    }


# def modify_page2_chart(handler, df):
#     district_id = handler.args['district_id_num'][0]
#     start_date = handler.args['start_date'][0]
#     end_date = handler.args['end_date'][0]
#     wname = [worst_indicator['name']]
#     df = df[df['indicator_name'].isin(wname)]
#     df = df.iloc[-12:]
#     df['month'] = pd.DatetimeIndex(df['date']).month
#     return df


def modify_page2_chart(handler, df):
    district_name = handler.args['district'][0]
    start_date = handler.args['start_date'][0]
    end_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = end_date - relativedelta(months=13)
    end_date = end_date.strftime("%Y-%m-%d")
    # wname = [worst_indicator['name']]
    negative_indicator = [
        "Still birth ratio",
        "% of facilities reported non blank value (including zero) for the identified indicators of ranking",
    ]
    df['date'] = pd.to_datetime(df['date'])
    graph_data = df.loc[(df['date'] <= start_date) & (df['date'] > end_date)]
    indicator_name = graph_data['indicator_name'][0]
    unique_dates = graph_data.date.unique()
    final_df = pd.DataFrame()
    s_date = datetime.strptime(start_date, "%Y-%m-%d")
    e_date = datetime.strptime(end_date, "%Y-%m-%d")
    db_s_date = datetime.strptime('2017-10-01', "%Y-%m-%d")
    if e_date <= db_s_date:
        e_date = datetime.strptime('2017-09-01', "%Y-%m-%d")
    diff_month = relativedelta(s_date, e_date)
    res_months = diff_month.months + (diff_month.years * 12)
    for ind in range(res_months):
        curr_date = unique_dates[ind]
        month_data = df.loc[(df['date'] == curr_date)]
        if indicator_name not in negative_indicator:
            month_data = month_data.sort_values(by=['value'], ascending=False)
        else:
            month_data = month_data.sort_values(by=['value'])
        month_data_length = len(month_data.index)
        counter = 1
        for data_ind in range(month_data_length):
            if data_ind != 0:
                if month_data['value'][data_ind - 1] == month_data['value'][data_ind]:
                    counter -= 1
                    month_data = month_data.reset_index(drop=True)
                    month_data['indicator_rank'][data_ind] = counter
                    counter += 1
                else:
                    month_data = month_data.reset_index(drop=True)
                    month_data['indicator_rank'][data_ind] = counter
                    counter += 1
            else:
                month_data = month_data.reset_index(drop=True)
                month_data['indicator_rank'][data_ind] = counter
                counter += 1
        final_df = final_df.append(month_data, ignore_index=True)
        # breakpoint()
    final_df = final_df.loc[final_df['district_name'] == district_name]
    # final_df.loc[final_df.value == 0, 'indicator_rank'] = ' -'
    final_df['month'] = pd.DatetimeIndex(final_df['date']).month
    return final_df


def modify_page3_chart(handler, df):
    start_date = handler.args['start_date'][0]
    end_date = handler.args['end_date'][0]
    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%Y-%m-%d')
    df1 = df['current_year']
    df2 = df['previous_year']
    dist_df1 = df['district_current_year']
    dist_df2 = df['district_previous_year']
    df1['date'] = pd.to_datetime(df1['date'])
    df2['date'] = pd.to_datetime(df2['date'])
    dist_df1['date'] = pd.to_datetime(dist_df1['date'])
    dist_df2['date'] = pd.to_datetime(dist_df2['date'])
    return {'curr': df1, "prev": df2, 'dist_curr': dist_df1, 'dist_prev': dist_df2}

    # df1 = df1[df1['indicator_name'].isin(wname)]
    # df2 = df2[df2['indicator_name'].isin(wname)]
    # # df = df.set_index(df['date'])
    # # df = df.sort_index()
    # # df1 = df.loc[df['date'] == start_date]
    # # df2 = df.loc[df['date'] == end_date]
    # # df2_score = df.loc[df['score']]
    # df1.drop(df1.columns.difference(['score', 'block_name']), 1, inplace=True)
    # df2.drop(df2.columns.difference(['score', 'block_name']), 1, inplace=True)
    # print(df1, 'df1')
    # print(df2, 'df2')
    # df2 = df2.rename(columns = {'score':'perc_point_prev'}, inplace = False)
    # df3 = pd.merge(left=df1, right=df2, left_on='block_name', right_on='block_name', how='left')
    # df3 = df3.fillna(0)
    # df3 = df3.round(1)
    # df3['chanage']= df3['score']-df3['perc_point_prev']
    # df3 = df3.rename(columns = {'score':'perc_point'}, inplace = False)
    # # print(df2_score, 'df2 score')
    # # df3 = pd.concat([df1, df2], axis=1, join_axes=[df1.index])
    # return df3


def modify_page1(handler, df):
    start_date = handler.args['start_date'][0]
    end_date = handler.args['end_date'][0]
    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
    end_dt = datetime.strptime(end_date, '%Y-%m-%d')
    res_dict = {
        'district_data': df['district_data'],
        'rankdata_curr': df['rankdata_curr'],
        'rankdata_prev': df['rankdata_prev'],
        'block_data': df['block_data'],
        'block_data_prev': df['block_data_prev'],
        'district_name': df['districtname'],
        'curr_month': pd.DataFrame({'curr_month': monarr[start_dt.month]}, index=['row1']),
        'curr_year': pd.DataFrame({'curr_year': start_dt.year}, index=['row1']),
        'prev_month': pd.DataFrame({'prev_month': monarr[end_dt.month]}, index=['row1']),
        'prev_year': pd.DataFrame({'prev_year': end_dt.year}, index=['row1']),
    }
    return res_dict


def modify_page3(handler, df):
    df1 = df['up_avg_curr_month']
    # df1 = df1[df1['indicator_id'] == id_]
    df2 = df['up_avg_prev_month']
    # df2 = df2[df2['indicator_id'] == id_]
    df3 = df['district_avg']
    # df3 = df3[df3['indicator_id'] == id_]
    df3 = df3.sort_values(by='date', ascending=True)
    return {
        'total_blocks': df['block_count'],
        'worst_indicator': pd.DataFrame(second_worst, index=['row1']),
        'district_avg': df3,
        'up_avg_curr_mnth': df1,
        'up_avg_prev_mnth': df2,
    }
