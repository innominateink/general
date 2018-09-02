#!/bin/bash

CLIENT_ID=""

if [ $# -eq 0 ]
    then
    echo "Provide song URL."
    exit 1
fi

SONG_URL=$1
TRACK_URL=$(curl -G "http://api.soundcloud.com/resolve" --data-urlencode "url=$SONG_URL" --data-urlencode "client_id=$CLIENT_ID" | jq -r .location)
SONG_DATA=$(curl -G $TRACK_URL)
STREAM_URL=$(echo $SONG_DATA | jq -r .stream_url)?client_id=$CLIENT_ID
TITLE=$(echo $SONG_DATA | jq -r .title)
NAME=$(echo $SONG_DATA | jq -r .user.username)

echo "$SONG_DATA"
#wget -O "$NAME - $TITLE.mp3" "$STREAM_URL"

#mid3v2 -a "$NAME" -t "$TITLE" "$NAME - $TITLE.mp3"

exit 0
