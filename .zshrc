alias lint='yarn format'

function delete_branches_by_keyword() {
  if [ -z "$1" ]; then
    echo "Usage: delete_branch_by_keyword <keyword>"
    return 1
  fi
  # checkout to main branch
  git checkout main > /dev/null 2>&1
  # delete branch by keyword
  git branch -D $(git branch | grep $1 | sed "s/^$1//")
}
