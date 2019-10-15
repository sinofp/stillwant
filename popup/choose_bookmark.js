/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
document.addEventListener('DOMContentLoaded', function () {
  const popupList = document.getElementById('popup-content')

  function listenEvents (displayDict) {
    document.addEventListener('click', e => {
      if (e.target.nodeName === 'BUTTON') {
        // BUTTON -> DIV hidden -> DIV item
        const bookmarkTitle =
          e.target.parentNode.parentNode.firstChild.nodeValue
        console.log(bookmarkTitle)
        console.log(e.target.textContent)
        switch (e.target.textContent) {
          case 'Delete':
            browser.bookmarks.remove(displayDict[bookmarkTitle].id)
            e.target.parentNode.parentElement.remove()
            const itemExists = document.querySelector('.item')
            if (!itemExists) {
              const newP = document.createElement('p')
              newP.className = 'error'
              newP.textContent =
                'Please click the extension icon again to refresh the list.'
              popupList.appendChild(newP)
            }
            break
          case 'Open':
            browser.tabs.create({ url: displayDict[bookmarkTitle].url })
            break
        }
      }
    })

    // create some *DOM mutations* to force firefox resize popup window
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups#Popup_resizing
    const wastediv = document.createElement('div')
    document.addEventListener('mouseout', e => {
      console.log(`mouseout: ${e.target.nodeName}`)
      popupList.appendChild(wastediv)
    })
  }

  function onFulfilled (bookmarkItems) {
    const bookmarks = bookmarkItems.filter(
      item => item.type === 'bookmark' && !item.url.startsWith('place:') // place:sort=8&maxResults=10 is Most Visited
    )
    const displayDict = {}
    if (bookmarks.length < 5) {
      const newP = document.createElement('p')
      newP.className = 'error'
      newP.textContent =
        'Please consider deleting bookmarks after you get more than 5 of them!'
      popupList.appendChild(newP)
    } else {
      for (let i = 0; i < 5; i++) {
        const the_chosen_one = Math.floor(Math.random() * bookmarks.length)
        const itemDiv = document.createElement('div')
        itemDiv.className = 'item'
        itemDiv.textContent = bookmarks[the_chosen_one].title
        displayDict[itemDiv.textContent] = {
          id: bookmarks[the_chosen_one].id,
          url: bookmarks[the_chosen_one].url
        }
        popupList.appendChild(itemDiv)

        const hiddenDiv = document.createElement('div')
        hiddenDiv.className = 'hidden'
        itemDiv.appendChild(hiddenDiv)
        const urlP = document.createElement('p')
        urlP.textContent = bookmarks[the_chosen_one].url
        hiddenDiv.appendChild(urlP)
        ;['Open', 'Delete'].forEach(function (action) {
          const newButton = document.createElement('button')
          newButton.textContent = action
          hiddenDiv.appendChild(newButton)
        })

        bookmarks.splice(the_chosen_one, 1)
      }
    }

    listenEvents(displayDict)
  }

  function onRejected (error) {
    console.log(`An error: ${error}`)
  }

  var searching = browser.bookmarks.search({})
  searching.then(onFulfilled, onRejected)
})
