Pod::Spec.new do |s|
  s.name           = 'ApplePayIntent'
  s.version        = '1.1.0'
  s.summary        = 'Apple Pay Shortcuts intent for Kebo'
  s.description    = 'Expo module for logging Apple Pay transactions via iOS Shortcuts'
  s.author         = 'Kebo'
  s.homepage       = 'https://github.com/kebo-app'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift}'
end
