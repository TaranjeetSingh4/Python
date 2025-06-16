import pandas as pd
import os.path
PATH = os.path.dirname(__file__)

print("m7ggqyMXhyL")

#for cmo
# prev_date = '202210'
# cur_date = '202211'

#for niti
# prev_date = 202202
# cur_date = 202203

# niti
# df= pd.read_csv('data/subindicator_scores_districts_niti.csv')

# cmo
# df= pd.read_csv('data/subindicator_scores_districts_cmo.csv')

# subindicator_scores_list = ['data_niti/subindicator_scores_districts_niti.csv','data_cmo/subindicator_scores_districts_cmo.csv']

def datamerge(dashboard_ids,prev_date,cur_date):
    # prev_date = '202211'
    # cur_date = '202212'
    sub_indicator_blocks_list = []
    if 'health_ranking_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data/subindicator_scores_districts.csv')
    if 'niti_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_niti/subindicator_scores_districts_niti.csv')
    if 'cm_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_cm/subindicator_scores_districts_cm.csv')
    if 'cmo_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_cmo/subindicator_scores_districts_cmo.csv')


    for sub_ind in sub_indicator_blocks_list:
        filepath = os.path.join(PATH,sub_ind)
        df= pd.read_csv(filepath)

        # print(df.columns)
        # print(df['date'].unique())
        tb_prev = df[(df['date'] == prev_date) & (df['subindicator_id'] == 'm7ggqyMXhyL')]
        # print(tb_prev)

        tb_cur = df[(df['date'] == cur_date) & (df['subindicator_id'] == 'm7ggqyMXhyL')]
        # print(tb_cur)

        df_rmv_cur = df.drop(tb_cur.index)

        # print(df_rmv_cur[(df_rmv_cur['date'] == cur_date) & (df_rmv_cur['subindicator_id'] == 'm7ggqyMXhyL')])
        # print(df_rmv_cur['date'].unique())
        tb_prev['date'] = tb_prev['date'].map({prev_date: cur_date})
        # print(tb_prev)

        # print(tb_prev.columns)
        # print(df_rmv_cur.columns)

        df_final = pd.concat([df_rmv_cur,tb_prev])
        # print(df_final[(df_final['date'] == cur_date) & (df_final['subindicator_id'] == 'm7ggqyMXhyL')])
        print(df_final)

        # if sub_ind == 'subindicator_scores_districts_niti.csv':
        #     # niti
        #     df_final.to_csv('output/subindicator_scores_districts_niti.csv',index=False)
        # else:
        #     # cmo
        #     df_final.to_csv('output/subindicator_scores_districts_cmo.csv',index=False)
        fpath = os.path.join(PATH,'tbmerge',sub_ind)
        df_final.to_csv(fpath,index=False)

        data_back = pd.read_csv(fpath)

        f_back = os.path.join(PATH,sub_ind)

        data_back.to_csv(f_back,index=False)
