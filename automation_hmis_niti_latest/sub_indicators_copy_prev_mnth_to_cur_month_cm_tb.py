import pandas as pd

import os.path
PATH = os.path.dirname(__file__)

def datamerge(prev_date,cur_date):
    # prev_date = 202209
    # cur_date = 202210
    # df= pd.read_csv('data/subindicator_scores_districts.csv')
    fpl = os.path.join(PATH,'data_cm','subindicator_scores_districts_cm.csv')
    df= pd.read_csv(fpl)

    print(df.columns)

    print(df['date'].unique())

    tb_cur = df[(df['date'] == cur_date) & (df['subindicator_id'] == 'm7ggqyMXhyL')]

    print(tb_cur)

    df_rmv_cur = df.drop(tb_cur.index)

    print(df_rmv_cur[(df_rmv_cur['date'] == cur_date) & (df_rmv_cur['subindicator_id'] == 'm7ggqyMXhyL')])

    print(df_rmv_cur)

    tb_prev = df_rmv_cur[(df_rmv_cur['date'] == prev_date) & (df_rmv_cur['subindicator_id'] == 'm7ggqyMXhyL')]

    print(tb_prev)

    print(tb_prev['date'].unique())

    tb_prev['date'] = tb_prev['date'].map({prev_date: cur_date})

    print(tb_prev)

    print(tb_prev.columns)

    # no_tb_feb.columns

    print(df_rmv_cur.columns)

    df_final = pd.concat([df_rmv_cur,tb_prev])

    print(df_final[(df_final['date'] == cur_date) & (df_final['subindicator_id'] == 'm7ggqyMXhyL')])

    print(df_final)

    fpath = os.path.join(PATH,'tbmerge','data_cm','subindicator_scores_districts_cm.csv')

    df_final.to_csv(fpath,index=False)

    data_back = pd.read_csv(fpath)

    fback = os.path.join(PATH,'data_cm','subindicator_scores_districts_cm.csv')

    data_back.to_csv(fback,index=False)
