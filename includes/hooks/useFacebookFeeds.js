// useFacebookFeeds.js
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import { pageId, pageAccessToken } from '@env';
import apiClient from '../api/apiClient.js';

const fetchProfilePic = async () => {
  const response = await axios.get(
    `https://graph.facebook.com/v23.0/${pageId}`,
    {
      params: {
        fields: 'picture',
        access_token: pageAccessToken,
      },
    },
  );
  return response.data.picture.data.url;
};

const fetchPosts = async () => {
  const response = await axios.get(
    `https://graph.facebook.com/v23.0/${pageId}/posts`,
    {
      params: {
        fields:
          'message,created_time,attachments{media_type,media,subattachments.limit(20)}',
        access_token: pageAccessToken,
      },
    },
  );
  const filteredPosts = response.data.data.filter(
    post => post.attachments && post.attachments.data.length > 0,
  );
  return filteredPosts;
};

export const useFacebookFeeds = () => {
  const staleTime = 5 * 60 * 1000; 

  const profilePicQuery = useQuery({
    queryKey: ['facebookProfilePic', pageId],
    queryFn: fetchProfilePic,
    staleTime: staleTime,
  });

  const postsQuery = useQuery({
    queryKey: ['facebookPosts', pageId],
    queryFn: fetchPosts,
    staleTime: staleTime,
  });

  return {profilePicQuery, postsQuery};
};