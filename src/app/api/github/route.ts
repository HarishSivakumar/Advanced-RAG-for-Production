import { NextResponse } from 'next/server';

export async function GET() {
  const username = process.env.GITHUB_USERNAME || 'harishsivakumar';

  try {
    // Fetch user data and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=owner`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }),
          },
          next: { revalidate: 3600 },
        }
      ),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error('GitHub API request failed');
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    // Filter out forks and calculate language stats
    const ownRepos = repos.filter((r: { fork: boolean }) => !r.fork);

    // Aggregate language stats from repos
    const languages: Record<string, number> = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }

    // Sort repos by stars, then by update time
    const sortedRepos = ownRepos.sort(
      (a: { stargazers_count: number; updated_at: string }, b: { stargazers_count: number; updated_at: string }) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return NextResponse.json({
      user: {
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
      },
      repos: sortedRepos.slice(0, 12).map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        topics: r.topics,
        updated_at: r.updated_at,
      })),
      languages,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { user: null, repos: [], languages: {} },
      { status: 200 } // Don't break the page if GitHub fails
    );
  }
}
