import pandas as pd
import os.path
# !pip install openpyxl
PATH = os.path.dirname(__file__)
ou_id_mappings = pd.read_excel(os.path.join(PATH,"data","ou_id_mapping_updated.xlsx"))
# phase 1
#for indicator 15
# csv_file = 'indicator_15_data.csv'
#for indicator 16
csv_file = ['data/indicator_15_data.csv','data/indicator_16_data.csv']

def datamerge(dates):
    for ind in csv_file:
        filepath = os.path.join(PATH,ind)
        p1_ind_15 = pd.read_csv('{}'.format(filepath))
        print(p1_ind_15.columns)
        print(p1_ind_15.date.unique())
        # dates = [202004,202005,202006,202007,202008,202009]
        # dates = [202211]
        data_2020 = p1_ind_15[p1_ind_15['date'].isin(dates)]
        print(data_2020.date.unique())
        print(data_2020.columns)
        data = p1_ind_15.drop(data_2020.index)
        print(data.date.unique())
        # block names: {old-block_name: new_block_name}
        # new_block_dict =  dict(zip(ou_id_mappings['block'], ou_id_mappings['updated_block_name']))
        # block ids: {old_block_ids: new_block_id}
        # new_block_ids =  dict(zip(ou_id_mappings['block_uid'], ou_id_mappings['updated_block_uid']))
        print(len(ou_id_mappings['block_uid'].unique()))
        # ou_id_mappings['updated_block_uid'].unique()
        print(len(list(ou_id_mappings['updated_block_uid'].unique())))
        new_block_ids = list(ou_id_mappings['updated_block_uid'].unique())
        print(len(new_block_ids))
        # mapping new block names
        # data_2020['updated_block_id'] = data_2020['block_id'].map(new_block_ids)
        print(len(data_2020))
        print(len(data_2020['block_id'].unique()))
        data_2020_filtered = data_2020[data_2020['block_id'].isin(new_block_ids)]
        print(len(data_2020_filtered))
        print(len(data_2020_filtered['block_id'].unique()))
        # for indicator_15
        if ind == 'indicator_15_data.csv':
            data_2020_filtered.query('date=={} and block_id == "qSjbxzH099H" and indicator_id =="indicator_15"'.format(dates[0]))
            df = pd.concat([data,data_2020_filtered])
            df.query('date=={} and block_id == "fDgjRPtNpqt" and indicator_id =="indicator_15"'.format(dates[0]))
        else:
            # for indicator_16
            data_2020_filtered.query('date=={} and block_id == "qSjbxzH099H" and indicator_id =="indicator_16"'.format(dates[0]))
            df = pd.concat([data,data_2020_filtered])
            df.query('date=={} and block_id == "fDgjRPtNpqt" and indicator_id =="indicator_16"'.format(dates[0]))





        # phase 1
        fpath = os.path.join(PATH,"blockmerge",ind)
        df.to_csv('{}'.format(fpath),index=False)

        data_back = pd.read_csv('{}'.format(fpath))

        data_back.to_csv('{}'.format(filepath),index=False)
