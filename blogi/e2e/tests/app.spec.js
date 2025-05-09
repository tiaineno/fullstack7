const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, like } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Olli',
        username: 'testaaja',
        password: 'test'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Antti',
        username: 'testaaja2',
        password: 'test'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
        await loginWith(page, 'testaaja', 'test')
  
        await expect(page.getByText('testaaja logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        await loginWith(page, 'testaaja', 'wrong')

        const errorDiv = await page.locator('.notif')
        await expect(errorDiv).toContainText('Wrong credentials')
        await expect(errorDiv).toHaveCSS('border-style', 'solid')
        await expect(errorDiv).toHaveCSS('background', /rgb\(255, 0, 0\).*/)
        await expect(page.getByText('Olli logged in')).not.toBeVisible()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
        await loginWith(page, 'testaaja', 'test')
    })
  
    test('a new blog can be created', async ({ page }) => {
        await createBlog(page, 'a blog created by playwright', 'playwright', 'test.com')
        await expect(page.getByText('a blog created by playwright playwright')).toBeVisible()
    })

    test('blog can be liked', async ({ page }) => {
        await createBlog(page, 'a blog created by playwright', 'playwright', 'test.com')
        await page.getByRole('button', { name: 'view' }).click()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('blog can be removed', async ({ page }) => {
      await createBlog(page, 'a blog created by playwright', 'playwright', 'test.com')
      page.on('dialog', async dialog => await dialog.accept())
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('a blog created by playwright playwright')).not.toBeVisible()

      const errorDiv = await page.locator('.notif')
      await expect(errorDiv).toContainText('Blog removed')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('background', /rgb\(0, 128, 0\).*/)
    })

    test('remove button is not visible to other users', async ({ page }) => {
      await createBlog(page, 'a blog created by playwright', 'playwright', 'test.com')
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'testaaja2', 'test')
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are sorted correctly', async ({ page }) => {
      await createBlog(page, 'a', '1', 'test1.com')
      await createBlog(page, 'b', '2', 'test2.com')
      await createBlog(page, 'c', '3', 'test3.com')
      await page.getByText('c 3').waitFor()

      await page.getByText('a 1').locator('..').getByRole('button', { name: 'view' }).click()
      await page.getByText('b 2').locator('..').getByRole('button', { name: 'view' }).click()
      await page.getByText('c 3').locator('..').getByRole('button', { name: 'view' }).click()
      await page.getByText('test3.com').waitFor()

      await like(page, 'a 1', 1)
      await like(page, 'b 2', 1)
      await like(page, 'b 2', 2)
      await like(page, 'b 2', 3)
      await like(page, 'c 3', 1)
      await like(page, 'c 3', 2)

      const blogs = page.locator('.blog')
      
      await expect(blogs.nth(0).locator('..').getByText('b 2')).toBeVisible()
      await expect(blogs.nth(1).locator('..').getByText('c 3')).toBeVisible()
      await expect(blogs.nth(2).locator('..').getByText('a 1')).toBeVisible()
    })
  })
})