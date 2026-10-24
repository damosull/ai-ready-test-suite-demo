Implement the ticket in {{TICKET}} as Playwright end-to-end test coverage for the Saleor Dashboard.

Use the Playwright test agents in this repository, in order:

1. playwright-test-planner: explore the dashboard and write a test plan for this ticket under specs/.
2. playwright-test-generator: generate the test(s) from that plan into e2e/tests/.
3. playwright-test-healer: run the generated test(s) and fix any failures.

Do the work through those agents; do not write or edit test code yourself outside them.
The suite's own runner starts the stack (Saleor in Docker, dashboard on http://localhost:9200) from the Playwright config's global setup. Stop when the tests for this ticket pass.
