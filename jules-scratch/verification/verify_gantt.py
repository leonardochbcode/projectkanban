from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:9005/login")
    page.wait_for_selector("input[name='email']")
    page.get_by_label("Email").fill("admin@chb.com.br")
    page.get_by_label("Senha").fill("chb")
    page.get_by_role("button", name="Entrar").click()
    page.wait_for_url("http://localhost:9005/")

    # Navigate to Gantt chart page
    page.get_by_role("link", name="Gráfico Gantt").click()
    page.wait_for_url("http://localhost:9005/gantt")

    # Select the first project
    page.get_by_role("combobox").click()
    page.get_by_label("Projeto de Desenvolvimento de").click()

    # Generate chart
    page.get_by_role("button", name="Gerar Gráfico Gantt").click()

    # Wait for the chart to be rendered
    page.wait_for_selector("svg.gantt")

    # Take screenshot
    page.screenshot(path="jules-scratch/verification/gantt_chart.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)