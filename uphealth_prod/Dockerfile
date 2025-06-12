FROM continuumio/anaconda3:5.2.0

LABEL description="Gramener data visualization server"
LABEL version="1.50.0"
LABEL maintainer="s.anand@gramener.com"

RUN pip install --upgrade pip
RUN apt-get update && apt-get install -y gnupg
# Install nodejs and node libraries
#RUN apt-get install -y libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxdamage1 \
#            libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libgconf2-4 \
#            libasound2 libatk1.0-0 libgtk-3-0
RUN (curl -sL https://deb.nodesource.com/setup_8.x | bash -) && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
# Install Chrome / Puppeteer dependencies
# https://github.com/GoogleChrome/puppeteer/issues/404#issuecomment-323555784
    apt-get install -y libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxdamage1 \
            libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libgconf2-4 \
            libasound2 libatk1.0-0 libgtk-3-0
#RUN apt-get install mysql-server
#RUN pip uninstall gramex
# Install gramex
RUN pip install https://code.gramener.com/cto/gramex/repository/archive.tar.bz2?ref=v1.41.0
RUN gramex setup --all
RUN mkdir ~/up-tsu-desktop-run
# RUN pip install msgpack
# RUN pip install attrdict
ADD up-tsu-desktop-container ~/up-tsu-desktop-run
#RUN /bin/bash -c "/usr/bin/mysqld_safe --skip-grant-tables &" && \
#  sleep 5 && \
#  mysql -u root -e "CREATE DATABASE uptsu_pwd" && \
#  mysql -u root uptsu_pwd < uptsu_pwd.sql
WORKDIR ~/up-tsu-desktop-run
EXPOSE 9876
CMD ["gramex", "--listen.port=9876"]
