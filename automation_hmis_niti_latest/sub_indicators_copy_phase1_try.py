import pandas as pd
import os.path
PATH = os.path.dirname(__file__)
# two tb indicators
a = 'B2A7x36qEry.Ti9FJqkSK6J' # numerator
b = 'GXgfTS67qxe.Ti9FJqkSK6J' # denominator

indicator_list = ['B2A7x36qEry.Ti9FJqkSK6J','GXgfTS67qxe.Ti9FJqkSK6J']

# indicator = b

# prev_date = 202210
# cur_date = 202211

def datamerge(prev_date,cur_date):
    # prev_date = 202210
    # cur_date = 202211
    for indicator in indicator_list:

        # phase1
        #  1st indicator
        if indicator == 'B2A7x36qEry.Ti9FJqkSK6J':
            fp1 = os.path.join(PATH,"data","subindicator_scores_districts.csv")
            df = pd.read_csv(fp1)

        # 2nd indicator
        elif indicator == 'GXgfTS67qxe.Ti9FJqkSK6J':
            fp2 = os.path.join(PATH,"tbmerge","data","subindicator_scores_districts.csv")
            df = pd.read_csv(fp2)

        # cmo
        # df = pd.read_csv('data/subindicator_scores_districts_cmo.csv')

        # df = pd.read_csv('output/subindicator_scores_districts_cmo.csv')

        print(df.columns)

        # df_tb_jan
        print(df['date'].unique())
        df_tb_cur = df[(df['date'] == cur_date) & (df['subindicator_id'] == indicator)]

        print(df_tb_cur)

        # removing feb data and storing remaing data
        df_rmv_cur = df.drop(df_tb_cur.index)

        print(df['date'].unique())

        print(df_rmv_cur[(df_rmv_cur['date'] == cur_date) & (df_rmv_cur['subindicator_id'] == indicator)])

        tb_prev = df[(df['date'] == prev_date) & (df['subindicator_id'] == indicator)]

        print(tb_prev)

        print(tb_prev['date'].unique())

        tb_prev['date'] = tb_prev['date'].map({prev_date: cur_date})

        print(tb_prev)

        print(tb_prev.columns)

        print(df_rmv_cur.columns)

        df_final = pd.concat([df_rmv_cur,tb_prev])

        print(df_final[(df_final['date'] == cur_date) & (df_final['subindicator_id'] == indicator)])

        # df_cmo = df_final.drop_duplicates()
        df_final.drop_duplicates(inplace=True)
        fpath = os.path.join(PATH,'tbmerge','data','subindicator_scores_districts.csv')

        df_final.to_csv(fpath,index=False)
        #
        data_back = pd.read_csv(fpath)
        fback = os.path.join(PATH,'data','subindicator_scores_districts.csv')

        data_back.to_csv(fback,index=False)
        # df_final.to_csv('output/subindicator_scores_districts_cmo.csv',index=False)
