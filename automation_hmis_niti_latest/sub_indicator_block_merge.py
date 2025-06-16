import pandas as pd
import os.path
PATH = os.path.dirname(__file__)
ou_id_mappings = pd.read_excel(os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"))
# no_nan = ou_id_mappings[~ou_id_mappings['updated_block_uid'].isnull()]
print(len(ou_id_mappings['updated_block_uid'].unique()))
# ou_id_mappings['updated_block_uid'].unique()[33]

sub_indicator_blocks_list =['data\subindicator_scores_blocks.csv','data_niti\subindicator_scores_blocks_niti.csv']

# phase 1
# sub_indicator_blocks = pd.read_csv('data\subindicator_scores_blocks.csv')

# cm
# sub_indicator_blocks = pd.read_csv('data\subindicator_scores_blocks_cm.csv')

# niti
# sub_indicator_blocks = pd.read_csv('data\subindicator_scores_blocks_niti.csv')

# cmo
# sub_indicator_blocks = pd.read_csv('data\subindicator_scores_blocks_cmo.csv')

def datamerge(dashboard_ids, month, year):
    sub_indicator_blocks_list = []
    if 'health_ranking_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data/subindicator_scores_blocks.csv')
    if 'niti_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_niti/subindicator_scores_blocks_niti.csv')
    if 'cm_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_cm/subindicator_scores_blocks_cm.csv')
    if 'cmo_dashboard' in dashboard_ids:
        sub_indicator_blocks_list.append('data_cmo/subindicator_scores_blocks_cmo.csv')

    for sub_ind in sub_indicator_blocks_list:
        filepath = os.path.join(PATH,sub_ind)
        sub_indicator_blocks = pd.read_csv(filepath)

        sub_indicator_blocks['subindicator_id'].unique()
        sub_indicator_blocks['date'].unique()
        # month = 202211
        # year = 2022
        print(len(sub_indicator_blocks[sub_indicator_blocks['date'] == month]['subindicator_id'].unique()))

        dates = [year, month]

        data_2020 = sub_indicator_blocks[sub_indicator_blocks['date'].isin(dates)]
        print(data_2020['subindicator_id'].unique())
        print(data_2020.columns)
        print(data_2020.info())
        data_2020.drop_duplicates(inplace=True)

        print(len(data_2020['district_id'].unique()))
        print(len(data_2020[data_2020['date'] == month]['district_id'].unique()))
        print(len(data_2020[data_2020['date'] == month]['subindicator_id'].unique()))

        print(data_2020[data_2020['date'] == month]['subindicator_id'].unique())
        print(data_2020.date.unique())
        data = sub_indicator_blocks.drop(data_2020.index)
        print(data.info())
        print(data.date.unique())
        data.drop(data[data['date'] == year].index, inplace=True)
        # len(sub_indicator_blocks.query('date==202002')['subindicator_id'].unique())
        # block ids: {new_block_id: new_block_name}
        # {old_block_id: new_block_id}
        new_block_ids = dict(zip(ou_id_mappings['block_uid'], ou_id_mappings['updated_block_uid']))
        # # mapping block names: {new_block_id: new_block_name}
        # new_block_dict =  dict(zip(ou_id_mappings['block'], ou_id_mappings['updated_block_name']))
        # print("VALUES ----------------------->", new_block_ids)
        # mapping block names with new block ids
        new_block_dict =  dict(zip(ou_id_mappings['updated_block_uid'], ou_id_mappings['updated_block_name']))
        # print('NEW BLOCK NAMES DICTIONARY ------------------------> ', new_block_dict)
        # new_block_dict["F3H22yde6Oa"]
        # mapping new block names
        data_2020['updated_block_id'] = data_2020['district_id'].map(new_block_ids)
        data_2020['updated_block'] = data_2020['updated_block_id'].map(new_block_dict)


        sub_grp = data_2020.groupby(['subindicator_id','updated_block_id', 'updated_block', 'date']).sum().reset_index()

        sub_grp.query('date=={} and updated_block == "Lodha" and subindicator_id =="aknlXIekL1Z"'.format(month))

        sub_grp = sub_grp.rename(columns={'updated_block': 'district', 'updated_block_id': 'district_id'})
        # sub_grp['date'].unique()
        # not necessary
        # drop_0 = sub_grp.query('subindicator_id == "0"')
        # sub_grp.drop(drop_0.index,inplace=True)
        # reorder
        cols = ['date', 'district', 'district_id','subindicator_id', 'value']
        sub_grp = sub_grp[cols]
        # sub_grp.query('date==202009 and district == "Mainpuri Mainpuri" and subindicator_id =="ZpgnTGpSkeg.Ti9FJqkSK6J"')
        # sub_grp.query('date==202009 and district == "Lodha" and subindicator_id =="ZpgnTGpSkeg.Ti9FJqkSK6J"')
        # sub_grp.query('date==2020 and district == "Lodha" and subindicator_id =="TmeumlBaObG"')
        print(sub_grp.date.unique())

        print(len(sub_grp[sub_grp['date'] == month]['subindicator_id'].unique()))
        print(sub_grp[sub_grp['date'] == month]['subindicator_id'].unique())
        print(len(sub_grp[sub_grp['date'] == year]['subindicator_id'].unique()))
        print(sub_grp.columns)
        print(len(sub_grp['district_id'].unique()))
        print(sub_grp[sub_grp.duplicated()])
        print(data.info())
        df = pd.concat([data, sub_grp])
        print(df.info())
        print(df.date.unique())
        df.query('date== {} and district == "Lodha" and subindicator_id =="aknlXIekL1Z"'.format(month))
        df.drop_duplicates(inplace=True)

        # sub_grp.drop_duplicates(inplace=True)
        print(df.date.unique())
        _dup = df[df.duplicated()]
        print(_dup)
        print(df)

        # phase 1
        # df.to_csv('output\subindicator_scores_blocks.csv',index=False)
        out = sub_ind
        fpath = os.path.join(PATH,'blockmerge',out)
        # cm
        df.to_csv(fpath,index=False)

        data_back = pd.read_csv(fpath)

        f_back = os.path.join(PATH,out)

        data_back.to_csv(f_back,index=False)

        # niti
        # df.to_csv('output\subindicator_scores_blocks_niti.csv',index=False)

        # cmo
        # sub_grp.to_csv('output\subindicator_scores_blocks_cmo.csv',index=False)

        # sub_indicator_blocks
        # sub_grp.query('date==2020 and district == "Lodha" and subindicator_id =="TmeumlBaObG"')
        # data_2020.query('date==2020 and updated_block == "Lodha" and subindicator_id =="TmeumlBaObG"')
