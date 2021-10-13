import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from "prismic-dom";
import Prismic from "@prismicio/client";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

// 
import { getPrismicClient } from '../../services/prismic';
import Header from "../../components/Header";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>
  }
  const contentInHtml = post.data.content.map(item => {
    return `<h2>${item.heading}</h2> ${RichText.asHtml(item.body)}`;
  });

  const timeToRead = post.data.content.reduce((acc, item) => {
    const bodyText = RichText.asText(item.body);
    const splitted = bodyText.split(" ");
    const headingSplitted = item.heading.split(" ");
    const total = [...splitted, ...headingSplitted];
    return acc + total.length;
  }, 0);


  return (
    <div className={`${commonStyles.container} ${styles.container}`}>
      <Header />
      <img src={post.data.banner.url} />
      <main>
        <article className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoContainer}>
            <div className={styles.infoContainer}>
              <span>
                <FiCalendar />
                <time>{
                  format(new Date(post.first_publication_date), "d MMM yyyy",
                    {
                      locale: ptBR,
                    }
                  )}</time>
              </span>

              <span>
                <FiUser />
                <p>{post.data.author}</p>
              </span>

              <span>
                <FiClock />
                <p>{Math.ceil(timeToRead / 200)} min</p>
              </span>
            </div>

          </div>
          <div dangerouslySetInnerHTML={{ __html: contentInHtml }} />
        </article>
      </main>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const post = await prismic.query(Prismic.predicates.at("document.type", "posts"), {});

  return {
    paths: [
      { params: { slug: post.results[0].uid } },
      { params: { slug: post.results[1].uid } },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID("posts", String(slug), {});

  return {
    props: {
      post,
    },
  };
};

export default Post;