#!/bin/bash
#REQUIRES CLIENT_ID or the Soundcloud API will return 401 Unauthorized.
CLIENT_ID=""

if [ -z "$CLIENT_ID" ]
then
  echo "CLIENT_ID is not set!"
  exit 1
fi

if [ $# -eq 0 ]
then
  echo "Provide song URL."
  exit 1
fi

for SONG_URL in "$@"
do
  TRACK_URL=$(curl -G "http://api.soundcloud.com/resolve" --data-urlencode "url=$SONG_URL" --data-urlencode "client_id=$CLIENT_ID" | jq -r .location)
  SONG_DATA=$(curl -G $TRACK_URL)
  STREAM_URL=$(echo $SONG_DATA | jq -r .stream_url)?client_id=$CLIENT_ID
  TITLE=$(echo $SONG_DATA | jq -r .title)
  NAME=$(echo $SONG_DATA | jq -r .user.username)
  GENRE=$(echo $SONG_DATA | jq -r .genre)

  wget -O "$NAME - $TITLE.mp3" "$STREAM_URL"

  mid3v2 -a "$NAME" -t "$TITLE" -g "$GENRE" "$NAME - $TITLE.mp3"
done
exit 0
