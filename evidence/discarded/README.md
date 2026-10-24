# Discarded: first attempt at scoring round 2

The scoring scripts switch branches. Once `evidence/reviews/key.tsv` was tracked on `main`
and modified, git refused to switch ("Aborting"), so from ticket 02 on the type checks and the
three-run and broken-feature checks ran on `main`, where the round-2 specs do not exist. Every
run reads 0/3 and every "caught" reads yes for that reason, not because of the tests. The one
review that completed before the failure (ticket 01) is kept here too, unused, so nothing was
picked. Round 2 was then scored again from the start, committing evidence after every step.
