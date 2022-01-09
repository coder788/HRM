import React from 'react'
import {Card, Col, Row} from "antd";

const backgroundStyle = {
  backgroundImage: 'url(/img/others/img-17.jpg)',
  backgroundRepeat: 'repeat-y',
  backgroundSize: 'cover'
}

const PrivacyPolicy = () => {
  return (
    <div className="pt-5" style={backgroundStyle}>
      <div className="container d-flex flex-column justify-content-center">
        <Row justify="center">
          <Col xs={20} sm={20} md={20} lg={20}>
            <Card>
              <div className="my-2">
                <Row justify="center">
                  <Col xs={24} sm={24} md={20} lg={20}>
										<div className="text-center">
											<img className="img-fluid" src="/img/logo_big_alt.png" alt=""/>
											<h3 className="mt-5 font-weight-bold text-left">Privacy Policy</h3>
											<p className="mb-4 text-left">Last updated February 1st, 2021</p>
										</div>
									</Col>
                  <Col xs={24} sm={24} md={20} lg={20}>
                    <p>As used in this Privacy Policy, "ArabianFal" refers to all websites, mobile sites, applications, and other properties or services owned or operated by ArabianFal. By accessing and/or using this ArabianFal website or
                      any ArabianFal product or service available on or through this website, you are accepting the practices described in this Privacy Policy. ArabianFal strongly believes in keeping your personal information confidential.
                      The following policy describes what information we collect and how it is used and shared</p>

                    <h4>Information Collected</h4>
                    <p>ArabianFal may collect personally identifiable information, such as your surname, first name, email address. Your personal information may be kept in identifiable or aggregate form (such that individuals cannot be
                      identified).</p>

                    <h4>Cookies / IP Address</h4>
                    <p>Cookies: a cookie is a small text file, containing such information as your IP address and operating system, that is stored on your computer's hard drive and which helps us to recognize your browser and improve your
                      online experience. Cookies do not contain any personal information. Browsers can be configured to inform you when a cookie is received. This allows you to accept or decline cookies.</p>

                    <h4>Use Of Collected Information</h4>
                    <p>We use the Information we obtain from or concerning you or your computer or device to provide ArabianFal products and services, fulfill your requests, improve our products and services, personalize and tailor your
                      experience on ArabianFal, operate our business, and understand how users are engaging with ArabianFal.
                      In addition, we may use Information from or concerning you or your computer or device to facilitate the delivery of content or advertisements that we believe may be of interest to you, or to communicate with you about
                      new or existing products and services or special offers. For example, we may periodically send promotional materials or notifications related to our products and services to the email address associated with your
                      account.</p>

                    <h4>Links To Third-Party Sites</h4>
                    <p>The ArabianFal website/Apps may contain links to other websites over which ArabianFal exercises no control and which are not covered by this privacy policy. If you use a link on our website to access other sites, the
                      operators of such sites may collect personal information for their own needs and in accordance with their own privacy policy.</p>

                    <h4>Children's Guidelines</h4>
                    <p>This website is directed at adults, not children under the age of 13 without a supervisor, and we do not seek to collect from children online contact information or distribution to third parties any personally
                      identifiable information from children or entice children to divulge information to us.</p>

                    <h4>Data Security</h4>
                    <p>Since no data transmitted over Internet or stored on Internet servers can be guaranteed to be absolutely secure, ArabianFal cannot ensure or warrant the security of any personally identifiable information you are
                      transmitting to the websites/Apps or posting it on non-public (restricted or private) pages. You understand and acknowledge that the submission of any such information by you via the Internet or posting it on
                      non-public (restricted or private) pages is at our own risk. Once ArabianFal receives your information it makes efforts to ensure its security on its platform and websites. To prevent unauthorized access, maintain data
                      accuracy, and ensure the correct use of information, ArabianFal maintains appropriate physical, electronic, and procedural safeguards.</p>

                    <h4>Changes In Our Privacy Policy</h4>
                    <p>ArabianFal reserves the right to update and revise this privacy policy from time to time to reflect changes in legislation or any other developments. Any changes made to our privacy policy will be published on this
                      page, containing the "last updated" date.</p>

                    <h4>Contact Us</h4>
                    <p>If you have any questions, complaints, or comments regarding this Privacy Policy or our information collection practices, please contact us at <a href="mailto:info@arabianfal.net">info@arabianfal.net</a></p>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default PrivacyPolicy

