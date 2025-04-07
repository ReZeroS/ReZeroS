const github = require('@actions/github');
const core = require('@actions/core');
const table = require('markdown-table'); 
function renderREADME() {
  const readme = `### Hi there 👋

  I am a developer based in China/Shanghai.
  
  - 📫 [Blog] https://rezeros.github.io
  
   <a href="https://github.com/rezeros/Jaxer">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=Jaxer&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
  <a href="https://github.com/rezeros/git">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=git&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
  <a href="https://github.com/rezeros/zerobox">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=zerobox&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>

  <a href="https://github.com/rezeros/leetcode">
    <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=rezeros&repo=leetcode&title_color=fff&icon_color=79ff97&text_color=9f9f9f&bg_color=151515" />
  </a>
`;

  return Buffer.from(readme.replace(/^ {4}/gm, '')).toString('base64');
}


async function run() {
  try {
    const octokit = github.getOctokit(process.env.MY_PROFILE_TOKEN);
    const { data: user } = await octokit.rest.users.getAuthenticated();


    const REPO_NAME = user.login;

    const {
      data: { sha },
    } = await octokit.rest.repos.getReadme({
      owner: user.login,
      repo: REPO_NAME,
    });

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: REPO_NAME,
      path: 'README.md',
      sha,
      message: 'Update README.md',
      committer: {
        name: user.name,
        email: user.email,
      },
      content: renderREADME(),
    });
  } catch (err) {
    core.setFailed(err);
  }
}

run();
