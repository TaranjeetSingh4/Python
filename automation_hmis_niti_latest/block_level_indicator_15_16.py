import json
import requests
import pandas as pd
import os
import yaml
PATH = os.path.dirname(__file__)

def get_data_from_api(config, start_date, end_date, sub_indicator_id, indicator):
    """Get the data from api"""
    # url
    start_date = pd.to_datetime(start_date, format='%Y-%m-%d').strftime('%Y%m')
    end_date = pd.to_datetime(end_date, format='%Y-%m-%d').strftime('%Y%m')
    # url = config['_url'].format(sub_indicator_id, 202002, 202004)
    url = config['url'].format(sub_indicator_id, start_date, end_date)
    # auth_details
    auth_details = config['auth_details']
    # # breakpoint()
    try:
        user_pass = os.environ[auth_details['user_pass']
                               ] if auth_details[
                                   'user_pass'] in os.environ else auth_details['user_pass']
        api_response = requests.get(url, auth=(auth_details['user_name'], user_pass))
        if not api_response.status_code // 100 == 2:
            # Consider any status other than 2xx an error
            error = "Error: Unexpected response {}".format(api_response)
            error_json = {"error_type": [error], "url": [url]}
            exception_df = pd.DataFrame(error_json)
            write_df(exception_df, config['exception_filename'])
        # breakpoint()

        api_response_text = json.loads(api_response.text)
        # import pdb; pdb.set_trace()
        header_object = api_response_text['listGrid']['headers']
        data = api_response_text['listGrid']['rows']
        headers = []
        for item in header_object:
            headers.append(item['column'])
        final_data = pd.DataFrame(data, columns=headers)
        # # breakpoint()
        final_data['date'] = start_date
        final_data['end_date'] = end_date
        final_data['indicator_id'] = indicator
        final_data = final_data.rename(columns=config['columns_rename'])
        final_data = final_data.rename(columns={'perc': 'perc_point'})
        final_data = final_data.rename(columns={'blockuid':'block_id'})
        final_data = final_data.rename(columns={'ouuid':'block_id'})
        final_data = final_data[['date', 'indicator_id', 'block_id', 'perc_point']]
        # breakpoint()
        write_df(final_data, indicator+"_data.csv")
    except requests.exceptions.RequestException as e:
        # exceptions like an SSLError or InvalidURL
        error = "Error: {}".format(e)
        error_json = {"error_type": [error], "url": [url]}
        exception_df = pd.DataFrame(error_json)
        write_df(exception_df, config['exception_filename'])

def run_api_script_other():
    """run the date loop"""
    check_file = os.path.isfile('config.yaml')
    if check_file:
        with open("config.yaml", 'r', encoding='utf-8') as stream:
            try:
                config = yaml.load(stream)
                date_object = config['date']
                same_year = date_object['from']['year'] == date_object['to']['year']
                end_month = date_object['to']['month'] if same_year else None
                date_object = {'from': date_object['from']} if same_year else date_object
                for key in date_object:
                    year = date_object[key]['year']
                    year_ = year
                    month = 1 if key == "to" else date_object[key]['month']
                    if same_year is False:
                        end_month = 12 if key == "from" else date_object[key]['month']
                    print(type(end_month), type(month))
                    month = int(month)
                    end_month = int(end_month)
                    print(type(end_month), type(month))
                    while month <= end_month:
                        # end_day = monthrange(year, month)[1]
                        month = int(month)
                        start_date = "{}-{}".format(year, month)
                        # import pdb; pdb.set_trace()
                        if month == 10:
                            month_ = 12
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month == 11:
                            month_ = 1
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month == 12:
                            month_ = 2
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month <= 9:
                            month_ = month + 3

                        end_date = "{}-{}".format(year_, month_)
                        print('********',start_date, end_date)
                        get_data_from_api(config, start_date, end_date,
                                          'O9dvHAPcmkh', 'indicator_16')
                        month += 1
                # print("done")
            except yaml.YAMLError as exc:
                # print(exc)
                return
    else:
        # print("please add the config.yaml for the script")
        return



def run_api_script():
    """run the date loop"""
    check_file = os.path.isfile('config.yaml')
    if check_file:
        with open("config.yaml", 'r', encoding='utf-8') as stream:
            try:
                config = yaml.safe_load(stream)
                date_object = config['date']
                same_year = date_object['from']['year'] == date_object['to']['year']
                end_month = date_object['to']['month'] if same_year else None
                date_object = {'from': date_object['from']} if same_year else date_object
                # breakpoint()
                for key in date_object:
                    year = date_object[key]['year']
                    year_ = year
                    month = 1 if key == "to" else date_object[key]['month']
                    if same_year is False:
                        end_month = 12 if key == "from" else date_object[key]['month']
                    print(type(end_month), type(month))
                    month = int(month)
                    end_month = int(end_month)
                    print(type(end_month), type(month))
                    while month <= end_month:
                        # end_day = monthrange(year, month)[1]
                        month = int(month)
                        start_date = "{}-{}".format(year, month)
                        # import pdb; pdb.set_trace()
                        if month == 10:
                            month_ = 12
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month == 11:
                            month_ = 1
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month == 12:
                            month_ = 2
                            year_ = year+1
                            # if year == 2018:
                            #     year_ = 2019
                        elif month <= 9:
                            month_ = month + 3

                        end_date = "{}-{}".format(year_, month_)
                        print('********',start_date, end_date)
                        # breakpoint()
                        get_data_from_api(config, start_date, end_date,
                                          'O9dvHAPcmkh', 'indicator_16')
                        month += 1
                # print("done")
            except yaml.YAMLError as exc:
                # print(exc)
                return
    else:
        # print("please add the config.yaml for the script")
        return


def write_df(df, file_name):
    """Write the csv file"""
    # check_file = os.path.isfile(file_name)
    # # print(os.path)
    # if check_file:
    #     prev_data = pd.read_csv(file_name, encoding='utf-8')
    #     final_data = pd.concat([prev_data, final_data])
    # final_data.to_csv(file_name,  encoding='utf-8', index=False)

    # If date column not a object string, convert to string
    if (df['date'].dtype != 'O'):
        df['date'] = df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    fpath = os.path.join(PATH, 'data', file_name)
    if os.path.exists(fpath):
        ''' Removing same date data if exists '''
        remove_data = df['date'].unique().tolist()
        filter_data = pd.read_csv(fpath, encoding='utf-8')
        filter_data.drop(filter_data.loc[filter_data['date'].isin(remove_data)].index,
                         inplace=True)
        df = filter_data.append(df, ignore_index=True, sort=True)
    df.to_csv(
        fpath,
        index=False,
        encoding='utf-8')



def run_api_script_15():
    """run the date loop"""
    check_file = os.path.isfile('config.yaml')
    if check_file:
        with open("config.yaml", 'r', encoding='utf-8') as stream:
            try:
                config = yaml.safe_load(stream)
                date_object = config['date']
                same_year = date_object['from']['year'] == date_object['to']['year']
                end_month = date_object['to']['month'] if same_year else None
                date_object = {'from': date_object['from']} if same_year else date_object
                for key in date_object:
                    year = date_object[key]['year']
                    month = 1 if key == "to" else int(date_object[key]['month'])
                    if same_year is False:
                        end_month = 12 if key == "from" else int(date_object[key]['month'])
                    month = int(month)
                    end_month = int(end_month)
                    print(type(end_month), type(month))
                    while month <= end_month:
                        start_date = "{}-{}".format(year, month)
                        end_date = "{}-{}".format(year, month)
                        # print(start_date, end_date)
                        get_data_from_api(config, start_date, end_date,
                                          'q0RpwJhtGzS', 'indicator_15')
                        month += 1
                # print("done")
            except yaml.YAMLError as exc:
                return
    else:
        return

# run_api_script()
