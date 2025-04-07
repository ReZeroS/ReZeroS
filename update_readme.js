const github = require('@actions/github');
const core = require('@actions/core');
const table = require('markdown-table'); 
function renderREADME() {
  const readme = `### Hi there 👋

  I am a developer based in China/Shanghai.
  
  - 📫 [Blog] https://rezeros.github.io
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
