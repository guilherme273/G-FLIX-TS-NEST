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
