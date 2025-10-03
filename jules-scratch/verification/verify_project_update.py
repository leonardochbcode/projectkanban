import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Login
        print("Navigating to login page...")
        page.goto("http://localhost:9005/login")

        # Wait for the email input to be visible to ensure the page is loaded
        expect(page.get_by_label("Email")).to_be_visible(timeout=15000)
        print("Login page loaded.")

        print("Filling in credentials...")
        page.get_by_label("Email").fill("admin@chb.com.br")
        page.get_by_label("Senha").fill("chb") # Corrected label

        print("Submitting login form...")
        # Corrected button name
        page.get_by_role("button", name="Entrar com Email").click()

        # Wait for navigation to the dashboard after login
        print("Waiting for dashboard to load...")
        expect(page).to_have_url(re.compile(r".*/workspaces/.*"), timeout=15000)
        print("Login successful.")

        # 2. Navigate to the specific workspace and find the project
        print("Navigating to workspace 'ws-1'...")
        page.goto("http://localhost:9005/workspaces/ws-1")

        # Wait for the project table or relevant container to be visible
        print("Waiting for projects to load...")
        expect(page.get_by_text("Redesign do Website")).to_be_visible(timeout=10000)
        print("Projects loaded.")

        # 3. Open the edit dialog for the project
        print("Opening edit dialog for project 'Redesign do Website'...")
        project_row = page.get_by_role("row", name=re.compile("Redesign do Website", re.IGNORECASE))

        dropdown_trigger = project_row.get_by_role("button").nth(0)
        dropdown_trigger.click()

        page.get_by_role("menuitem", name="Editar").click()

        print("Edit dialog opened.")
        expect(page.get_by_role("heading", name="Editar Projeto")).to_be_visible()

        # 4. Modify the project
        new_project_name = "Redesign do Website (Atualizado)"
        print(f"Updating project name to: {new_project_name}")
        name_input = page.get_by_label("Nome")
        name_input.clear()
        name_input.fill(new_project_name)

        # 5. Save the changes
        print("Saving changes...")
        page.get_by_role("button", name="Salvar Alterações").click()

        # 6. Verify the change and take a screenshot
        print("Verifying the update...")
        expect(page.get_by_role("heading", name="Editar Projeto")).not_to_be_visible()
        expect(page.get_by_text(new_project_name)).to_be_visible(timeout=10000)
        print("Update successful. Taking screenshot...")

        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot saved to jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        raise
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)