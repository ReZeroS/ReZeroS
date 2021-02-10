const github = require('@actions/github');
const core = require('@actions/core');
const table = require('markdown-table');
// forked from https://github.com/sorxrob/sorxrob
function renderREADME(followersUrl, totalFollowers, selectedFollowers) {
  const readme = `### Hi there 👋

  I am a developer based in China/Beijing, specializing in building websites and applications.
  
  - 🌱 I’m currently learning K8s network and JUC.
  - 🤔 I’m looking for help with distributed development experiences.
  - 💬 Ask me about anything
  - 📫 How to reach me: [Blog] https://qqtim.club
  
  
  ![ReZero's github stats](https://github-readme-stats.vercel.app/api?username=rezeros&show_icons=true&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515)
  
  
  <a href="https://github.com/rezeros">
    <img align="center" src="https://github-readme-stats.vercel.app/api/top-langs/?username=rezeros&layout=compact" />
  </a>
  <a href="https://github.com/rezeros/zit">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=zit&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
  <a href="https://github.com/rezeros/zerobox">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=zerobox&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
  <a href="https://github.com/rezeros/leetcode">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=leetcode&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
 
  

    ## My Followers ([${totalFollowers}](${followersUrl}))
    
    ${generateTables(selectedFollowers)}`;

  return Buffer.from(readme.replace(/^ {4}/gm, '')).toString('base64');
}

function generateTables(followers) {
  if (!followers.length) return;

  if (followers.length > 4) {
    const top = followers.slice(0, 4);
    const bottom = followers.slice(4);

    const tbl1 = table(
      [top.map((i) => i.profilePicture), top.map((i) => i.profileUrl)],
      {
        align: top.map(() => 'c'),
      }
    );

    const tbl2 = table(
      [bottom.map((i) => i.profilePicture), bottom.map((i) => i.profileUrl)],
      {
        align: bottom.map(() => 'c'),
      }
    );

    return `${tbl1}\n\n${tbl2}`;
  }

  return table(
    [
      followers.map((i) => i.profilePicture),
      followers.map((i) => i.profileUrl),
    ],
    {
      align: top.map(() => 'c'),
    }
  );
}

async function run() {
  try {
    const octokit = github.getOctokit(process.env.MY_PROFILE_TOKEN);
    const { data: user } = await octokit.users.getAuthenticated();

    const itemsPerPage = 100; // Max is 100
    const noOfPages = Math.ceil(user.followers / itemsPerPage);
    const page = Math.floor(Math.random() * noOfPages) + 1;

    const {
      data: followers,
    } = await octokit.users.listFollowersForAuthenticatedUser({
      per_page: itemsPerPage,
      page,
    });

    const shuffledFollowers = [...followers].sort(() => 0.5 - Math.random());
    const selected = shuffledFollowers.slice(0, 8).map((item) => {
      return {
        profilePicture: `<img src="${item.avatar_url}" width="150" height="150" />`,
        profileUrl: `[${item.login}](${item.html_url})`,
      };
    });

    const REPO_NAME = user.login;

    const {
      data: { sha },
    } = await octokit.repos.getReadme({
      owner: user.login,
      repo: REPO_NAME,
    });

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: REPO_NAME,
      path: 'README.md',
      sha,
      message: 'Update README.md',
      committer: {
        name: user.name,
        email: user.email,
      },
      content: renderREADME(
        `https://github.com/${user.login}?tab=followers`,
        user.followers,
        selected
      ),
    });
  } catch (err) {
    core.setFailed(err);
  }
}

run();
