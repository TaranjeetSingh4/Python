import os
import gramex.cache
import pandas as pd
PATH = os.path.dirname(__file__)
directory = os.path.dirname(os.path.abspath(__file__))
dist_allfile = os.path.join(directory, 'data/subindicator_scores_districts.csv')
dist_filename = os.path.join(directory, 'data_cm/subindicator_scores_districts_cm.csv')
block_allfile = os.path.join(directory, 'data/subindicator_scores_blocks.csv')
block_filename = os.path.join(directory, 'data_cm/subindicator_scores_blocks_cm.csv')

sub_dict = {
    "ixBYYYjxXPP": "36a",
    "aRueVYr35yM.Ti9FJqkSK6J": "36b",
    "dwGorjVGkD9": "35a",
    "m7ggqyMXhyL": "37a",
    "indicator_2a": "2a",
    # "aRueVYr35yM.Ti9FJqkSK6J": "2a",
    "FRafAE8qFP6": "2b",
    "ux6uaflq7xZ": "2c",
    "g69FuEghiM5": "2d",
    "cB6y5lovUZX.Ti9FJqkSK6J": "NA",
    "GJKYhq2wR9L": "7a",
    "t03VPkJ5UXd": "7b",
    "B2A7x36qEry.Ti9FJqkSK6J": "10a",
    "GXgfTS67qxe.Ti9FJqkSK6J": "10b",
    'TmeumlBaObG': "NA",
}

block_sub_dict = {
    "ixBYYYjxXPP": "36a",
    "aRueVYr35yM.Ti9FJqkSK6J": "36b",
    "dwGorjVGkD9": "35a",
    "m7ggqyMXhyL": "37a",
    'ui45G8KwpzU.Ti9FJqkSK6J': "2a",
    'TmeumlBaObG': "2b",
    "GJKYhq2wR9L": "7a",
    "t03VPkJ5UXd": "7b",
    "NI0EC5no6PO": "10a",
    "TmeumlBaObG": "10b",
    "g69FuEghiM5": "2d",
}

ind_dict = {
    "2a": "indicator_2",
    "2b": "indicator_2",
    "2c": "indicator_2",
    "2d": "indicator_2",
    "7a": "indicator_7",
    "7b": "indicator_7",
    "10a": "indicator_10",
    "10b": "indicator_10",
    "35a": "indicator_35",
    "35b": "indicator_35",
    "36a": "indicator_36",
    "36b": "indicator_36",
    "37a": "indicator_37",
    "37b": "indicator_37",
    "NA": "indicator_NA",
}

indicators_df = gramex.cache.open('data/indicator_id_mapping_cm.csv',
                                  'csv', rel=True, encoding='utf-8')
division_map_ids = gramex.cache.open('data/division_map_id.csv', 'csv', rel=True, encoding='utf-8')
district_map_ids = gramex.cache.open('data/district_map_id.csv', 'csv', rel=True, encoding='utf-8')
block_map_ids = gramex.cache.open('data/block_map_id.csv', 'csv', rel=True, encoding='utf-8')
organisation_unit = gramex.cache.open('data/ou_id_mappings.csv', 'csv', rel=True, encoding='utf-8')[
    ['uid_district', 'district', 'uid_block', 'block', 'division']]

district_ids = ';'.join(organisation_unit['uid_district'].unique())
block_ids = ';'.join(organisation_unit['uid_block'].unique())

total_districts = organisation_unit[['uid_district', 'district']].drop_duplicates().reset_index()
total_districts.rename(index=str, columns={'uid_district': 'district_id'}, inplace=True)
del total_districts['index']

total_blocks = organisation_unit[['uid_district', 'district',
                                  'uid_block', 'block', 'division']].drop_duplicates().reset_index()
total_blocks.rename(index=str, columns={'uid_block': 'block_id',
                                        'uid_district': 'district_id'}, inplace=True)
del total_blocks['index']


# calc_type date        district            district_id     div_map_id  division            domain          indicator
# p         2017-04-01  Lakhimpur Kheri     d9ZuMopgX29     155         Lucknow Division    delivery_care   % of pregnant women...

# indicator_id      map_id      perc_point          type        year
# indicator_2       153         63.0193986581627    coverage    2018


# sub_indicator_df.rename(index=str, columns={'district_id': 'block_id', 'district': 'block'}, inplace=True)
# district_map_ids.rename(index=str, columns={'District': 'district'}, inplace=True)

def cm_sub_combine(prev_date,cur_date, year):

    def concat_dist_ind():
        dates = [year,cur_date]
        # phase1
        all_sub_ind_df = pd.read_csv(dist_allfile, encoding='utf-8')
        all_sub_ind_df = all_sub_ind_df.loc[all_sub_ind_df['date'].isin(dates)]
        # import pdb; pdb.set_trace();
        all_sub_ind_df.loc[all_sub_ind_df['subindicator_id'] == "aRueVYr35yM.Ti9FJqkSK6J", 'subindicator_id'] = 'indicator_2a'
        # cm
        sub_indicator_df = pd.read_csv(dist_filename, encoding='utf-8')
        sub_indicator_df = sub_indicator_df.loc[sub_indicator_df['date'].isin(dates)]
        for key in sub_dict.keys():
            sub_indicator_df = sub_indicator_df.append(all_sub_ind_df.loc[all_sub_ind_df['subindicator_id'] == key], ignore_index=True)
        sub_indicator_df.drop_duplicates(inplace=True)
        # print(sub_indicator_df.tail())
        filepath = os.path.join(PATH,'subindicator_scores_districts_cm.csv')
        sub_indicator_df.to_csv(filepath, index=False, encoding='utf-8')

    def concat_block_ind():
        dates = [year, cur_date]
        # phase1
        all_sub_ind_df = pd.read_csv(block_allfile, encoding='utf-8')
        all_sub_ind_df = all_sub_ind_df.loc[all_sub_ind_df['date'].isin(dates)]
        # cm
        sub_indicator_df = pd.read_csv(block_filename, encoding='utf-8')
        sub_indicator_df = sub_indicator_df.loc[sub_indicator_df['date'].isin(dates)]
        for key in block_sub_dict.keys():
            sub_indicator_df = sub_indicator_df.append(all_sub_ind_df.loc[all_sub_ind_df['subindicator_id'] == key], ignore_index=True)
        sub_indicator_df.drop_duplicates(inplace=True)
        # print(sub_indicator_df.tail())
        fpath = os.path.join(PATH,'subindicator_scores_blocks_cm.csv')
        sub_indicator_df.to_csv(fpath, index=False, encoding='utf-8')


    def add_quater(x):
        x = pd.to_datetime(x, format='%Y%m')
        if (x.month >= 1 and x.month <= 3):
            return 4
        elif (x.month >= 4 and x.month <= 6):
            return 1
        elif (x.month >= 7 and x.month <= 9):
            return 2
        elif (x.month >= 10 and x.month <= 12):
            return 3


    def convert_district_df(df, date_format):
        # import pdb; pdb.set_trace();
        if(date_format == '%Y%m'):
            df['date'] = df['date'].apply(lambda x: pd.to_datetime(x, format=date_format))
            df['quarter'] = df['date'].apply(lambda x: add_quater(x))
            df['year'] = df['date'].apply(lambda x: pd.to_datetime(
                x, format=date_format).year + 1 if pd.to_datetime(x, format=date_format).month > 3 else pd.to_datetime(x, format=date_format).year)
            df['date'] = df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        else:
            df['quarter'] = ''
            df['year'] = df['date'].apply(lambda x: x+1)
        df['sub_id'] = df['subindicator_id'].apply(lambda x: sub_dict[x])
        df['calc_type'] = 'p'
        df = pd.merge(df, division_map_ids, on='district')
        df = pd.merge(df, district_map_ids[['map_id', 'district_id']], on='district_id')
        df['indicator_id'] = df['sub_id'].apply(lambda x: ind_dict[x])
        return df


    def convert_block_df(df, date_format):
        df.rename(index=str, columns={'district_id': 'block_id', 'district': 'block'}, inplace=True)
        block_map_ids.rename(index=str, columns={'organisationunitid': 'block_id', 'organisationunitname': 'block', 'District': 'district', 'id_Shp_file': 'map_id'}, inplace=True)
        district_map_ids.rename(index=str, columns={'organisationunitname': 'district'}, inplace=True)
        if(date_format == '%Y%m'):
            df['date'] = df['date'].apply(lambda x: pd.to_datetime(x, format=date_format))
            df['quarter'] = df['date'].apply(lambda x: add_quater(x))
            df['year'] = df['date'].apply(lambda x: pd.to_datetime(
                x, format=date_format).year + 1 if pd.to_datetime(x, format=date_format).month > 3 else pd.to_datetime(x, format=date_format).year)
            df['date'] = df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        else:
            df['quarter'] = ''
            df['year'] = df['date'].apply(lambda x: x+1)
        df['sub_id'] = df['subindicator_id'].apply(lambda x: block_sub_dict[x])
        df['calc_type'] = 'p'
        print(df.head())
        print(district_map_ids.head())
        df = pd.merge(df, block_map_ids[['map_id', 'block_id', 'district']], on='block_id')
        df = pd.merge(df, district_map_ids[['district_id', 'district']], on='district')
        df['indicator_id'] = df['sub_id'].apply(lambda x: ind_dict[x])
        return df

    concat_dist_ind()
    concat_block_ind()

    file_path = os.path.join(PATH,'subindicator_scores_districts_cm.csv')

    sub_indicator_df = pd.read_csv(file_path, encoding='utf-8')
    month_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([cur_date])]
    year_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([year])]
    # month_subind_df = sub_indicator_df.loc[~sub_indicator_df['date'].isin([2017,2018,2019,2020])]
    # year_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([2017,2018,2019,2020])]
    month_new_df = convert_district_df(month_subind_df, '%Y%m')
    year_new_df = convert_district_df(year_subind_df, '%Y')
    new_df = month_new_df.append(year_new_df, ignore_index=True)
    f_path = os.path.join(PATH,"CM_data","subindicator_districts_cm.csv")
    new_df.to_csv(f_path, index=False, encoding='utf-8')

    f_path = os.path.join(PATH,'subindicator_scores_blocks_cm.csv')

    sub_indicator_df = pd.read_csv(f_path, encoding='utf-8')
    month_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([cur_date])]
    year_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([year])]
    # month_subind_df = sub_indicator_df.loc[~sub_indicator_df['date'].isin([2017,2018,2019,2020])]
    # year_subind_df = sub_indicator_df.loc[sub_indicator_df['date'].isin([2017,2018,2019,2020])]
    month_new_df = convert_block_df(month_subind_df, '%Y%m')
    year_new_df = convert_block_df(year_subind_df, '%Y')
    new_df = month_new_df.append(year_new_df, ignore_index=True)
    file_path = os.path.join(PATH,"CM_data","subindicator_blocks_cm.csv")
    new_df.to_csv(file_path, index=False, encoding='utf-8')


# cm_sub_combine()
