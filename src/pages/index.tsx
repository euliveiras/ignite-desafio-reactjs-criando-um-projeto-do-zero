import { GetStaticProps } from 'next';
import Link from "next/link";
import { RichText } from "prismic-dom";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { FiCalendar, FiUser } from "react-icons/fi";
import Prismic from "@prismicio/client";
// 
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from "../components/Header";
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    if (postsPagination) {
      return postsPagination.results.map(post => {
        return {
          ...post,
          first_publication_date: format(
            new Date(post.first_publication_date),
            "d MMM yyyy",
            {
              locale: ptBR,
            }
          )
        }
      })
    } else return [];
  });
  const [nextPage, setNextPage] = useState<null | string>(() => {
    if (postsPagination.next_page) return postsPagination.next_page;
    else return null;
  });

  const handleClick = async (): Promise<void> => {
    const response = await fetch(`${nextPage}`);
    const data = await response.json();
    const dataFormatted = data.results.map((post: Post) => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "d MMM yyyy",
          {
            locale: ptBR,
          }
        ),
      };
    });

    setPosts(oldPosts => {
      return [...oldPosts, ...dataFormatted];
    });
    setNextPage(data.results.next_page);
  };

  return (
    <>
      <main className={commonStyles.container}>
        <Header />
        {posts.map(post => {
          return (
            <section key={post.uid} className={styles.sectionContainer}>
              <Link href={`/post/${post.uid}`}>
                <h1>{post.data.title}</h1>
              </Link>
              <p>{post.data.subtitle}</p>
              <div className={styles.infoContainer}>
                <span>
                  <FiCalendar />
                  <time>
                    {post.first_publication_date}
                  </time>
                </span>

                <span>
                  <FiUser />
                  <p>{post.data.author}</p>
                </span>
              </div>
            </section>
          );
        })}
        {nextPage
          && <button type="button" className={styles.button} onClick={handleClick}>
            Carregar mais posts
          </button>

        }
      </main>
    </>

  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const allPosts = await prismic.query(Prismic.predicates.at("document.type", "posts"), {
    pageSize: 2
  });
  const formattedPosts = allPosts.results.map(({ uid, first_publication_date, data }) => {
    return {
      uid,
      first_publication_date,
      data: {
        title: data.title,
        subtitle: data.subtitle,
        author: data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results: formattedPosts,
        next_page: allPosts.next_page,
      },
    },
  };

};

export default Home;