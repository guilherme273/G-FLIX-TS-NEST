export class CreateMovieDto {
  title: string;
  url: string;
  cover: string;
  category_id: number;
  youtube_id: string;
}
export class GetMovieYoutubeDto {
  url: string;
  category_id: string;
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeSnippet {
  title: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
}

export interface YouTubeVideoItem {
  snippet: YouTubeSnippet;
}

export interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}
