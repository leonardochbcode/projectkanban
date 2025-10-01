from playwright.sync_api import sync_playwright, Page, expect

def verify_themes(page: Page):
    """
    This script verifies that the theme switcher works correctly and that the
    light and dark themes are applied as expected.
    """
    # 1. Navigate to the application. The dev server is on port 9005.
    page.goto("http://localhost:9005/")

    # Wait for the page to settle and for the theme switcher to be available.
    # The theme switcher is a button, let's locate it by its role and accessible name.
    theme_switcher_button = page.get_by_role("button", name="Toggle theme")
    expect(theme_switcher_button).to_be_visible()

    # 2. Click the theme switcher to open the dropdown.
    theme_switcher_button.click()

    # 3. Verify the dropdown menu contains the correct options and take a screenshot.
    dropdown_menu = page.locator('div[role="menu"]')
    expect(dropdown_menu).to_be_visible()
    expect(page.get_by_role("menuitem", name="Claro")).to_be_visible()
    expect(page.get_by_role("menuitem", name="Escuro")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01_theme_options.png")

    # 4. Select the "Escuro" (Dark) theme and verify the change.
    page.get_by_role("menuitem", name="Escuro").click()
    # Check for a class change or a specific color on an element.
    # The 'dark' class should be applied to the html element.
    expect(page.locator("html")).to_have_class("dark")
    page.screenshot(path="jules-scratch/verification/02_dark_theme.png")

    # 5. Switch back to the "Claro" (Light) theme.
    theme_switcher_button.click()
    page.get_by_role("menuitem", name="Claro").click()
    expect(page.locator("html")).to_have_class("light")
    page.screenshot(path="jules-scratch/verification/03_light_theme.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_themes(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()